import { differenceInMinutes, parseISO, format as formatDate } from "date-fns"
import { capitalizeWords, formatMode, MetaGridEntry } from "~/lib/util"
import { CurrentAndUpcomingEvents } from "~/model/Api"
import { Route, Location } from "vue-router"
import { State, Config, commonMeasurements, Dimension, Measurement, Slice, SliceValue, ValueType } from "~/lib/cube"
import * as d3format from "d3-format"
import { Plugin } from "@nuxt/types"

// workaround for https://github.com/vuejs/vue-router/issues/2725
// FIXME remove when upgrading to vue-router 3
function safeEncode(arr: (string|number|boolean|undefined)[]) {
  return arr
    .filter(s => s != undefined)
    .map(s => typeof s == 'string' ? s.replace(/%/g, '%23') : s!.toString())
}
function safeDecode(arr: (string|null|undefined)[]) {
  return arr?.map(s => s?.replace(/%23/g, '%'))
}

function parseQueryParams(query: Record<string, string | (string | null)[]>, prefix: string): object {
  return Object.fromEntries(
    Object.entries(query)
      .filter(([key, value]) => key.startsWith(prefix + '[') && key.endsWith(']'))
      .map(([key, value]) => [key.substring((prefix + '[').length, key.length - ']'.length), safeDecode(typeof value == 'string' ? [value] : value)])
  )
}

function generateQueryParams(o: Record<string, (string|number)[]>, prefix: string): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(o)
      .filter(([key, value]) => value != undefined && value.length > 0)
      .map(([key, value]) => [prefix + '[' + key + ']', safeEncode(value)])
  )
}

export interface PicksWins {
  picks: number
  wins: number
}

export interface EventMetadata {
  battle_event_id: number
  battle_event_map: string
  battle_event_mode: string
  battle_event_powerplay: boolean
  timestamp: string
  picks: number
  start?: string
  end?: string
}

export interface Slices extends Record<string, string[]|undefined> {}

interface Clicker {
  defaultSlicesRaw(cubeId: string): Record<string, string[]>
  query<T=any>(
    name: string,
    cube: string,
    dimensions: string[],
    measures: string[],
    slices: Slices,
    options: {
      sort?: Record<string, string>,
      limit?: number,
      cache?: number,
      totals?: boolean,
    }): Promise<{ data: T[], totals?: T, statistics: Record<string, number> }>
  queryActiveEvents(): Promise<EventMetadata[]>,
  queryActiveEvents<T extends EventMetadata>(measures: string[], slices: Slices, maxage: number): Promise<T[]>,
  queryAllModes(): Promise<string[]>
  queryAllMaps(mode?: string): Promise<{ battle_event_map: string, battle_event_id: number }[]>
  queryAllBrawlers(): Promise<string[]>
  describeSlices(slices: Slices, timestamp?: string): string
  calculateBayesSynergies(tag: string, brawler?: string, limit?: number): Promise<{
    sampleSize: number,
    timestamp: string,
    // H
    totals: PicksWins,
    // H(brawler)
    data: Map<string, PicksWins>,
    // H(ally_brawler,brawler)
    pairData: Map<string, Map<string, PicksWins>>,
  }>
  constructQuery(dimensions: Dimension[], measurements: Measurement[], slices: Slice[], slicesValues: SliceValue, metaColumns: string[]): { dimensions: string[], measurements: string[], slices: Record<string, string[]> }
  mapToMetaGridEntry(dimensions: Dimension[], measurements: Measurement[], rows: any[], totals: any|undefined, metaColumns: string[]): MetaGridEntry[]
  compareEntries(baseEntries: MetaGridEntry[], comparingEntries: MetaGridEntry[], mode: 'diff'|'test'): MetaGridEntry[]
  stateToLocation(state: Partial<State>): Location
  locationToState(location: Route, config: Config): State
  format(spec: { type: ValueType, formatter: string }, value: number|string|string[]): string
}

declare module 'vue/types/vue' {
  interface Vue {
    $clicker: Clicker
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $clicker: Clicker
  }
  interface Context {
    $clicker: Clicker
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $clicker: Clicker
  }
}

const plugin: Plugin = (context, inject) => {
  inject('clicker', <Clicker>{
    defaultSlicesRaw(cube) {
      switch (cube) {
        case 'map':
          return {
            trophy_season_end: ['month'],
            battle_event_powerplay: ['false'],
          }
        case 'battle':
          return {
            trophy_season_end: ['month'],
          }
        case 'brawler':
          return {
          }
        case 'synergy':
          return {
            trophy_season_end: ['month'],
            ally_brawler_name: ['SHELLY'],
          }
        default:
          return {
            trophy_season_end: ['month'],
          }
      }
    },
    query(name, cube, dimensions, measures, slices, options = {}) {
      // SSR does not support UrlSearchParams
      const query = {
        include: measures.join(','),
      }
      const headers = {} as Record<string, string>
      if (options.sort != undefined) {
        query['sort'] = Object.entries(options.sort || {}).map(([name, order]) => (order == 'desc' ? '-' : '') + name).join(',')
      }
      if (options.limit != undefined) {
        query['limit'] = options.limit.toString()
      }
      if (options.totals == true) {
        query['totals'] = options.totals.toString()
      }
      if (name != undefined) {
        headers['x-brawltime-tag'] = name
      }
      if (options.cache != undefined) {
        headers['x-brawltime-cache'] = options.cache.toString()
      }
      Object.entries(slices)
        .filter(([name, args]) => args != undefined)
        .forEach(([name, args]) => query['slice[' + name + ']'] = args!.join(','))
      const queryString = Object.entries(query)
        .sort(([k1, v1], [k2, v2]) => k1 < k2 ? -1 : k1 > k2 ? 1 : 0)
        .map(([k, v]) => k + '=' + encodeURIComponent(v))
        .join('&')
      const url = context.$config.clickerUrl + '/clicker/cube/' + cube + '/query/' + dimensions.join(',') + '?' + queryString
      console.log(`querying clicker: cube=${cube}, dimensions=${JSON.stringify(dimensions)}, measures=${JSON.stringify(measures)}, slices=${JSON.stringify(slices)} name=${name} (${url})`)
      return context.$http.$get(url, { headers })
    },
    async queryActiveEvents(measures = [], slices = {}, maxage = 60) {
      const events = await this.query<EventMetadata>('active.events', 'map',
        ['battle_event_mode', 'battle_event_map', 'battle_event_id', 'battle_event_powerplay'],
        ['battle_event_mode', 'battle_event_map', 'battle_event_id', 'battle_event_powerplay', 'timestamp', 'picks', ...measures],
        {
          trophy_season_end: ['current'],
          ...slices,
        },
        {
          sort: { timestamp: 'desc' },
          cache: 60*10,
          limit: 10,
        })

      const lastEvents = events.data
        .filter(e => differenceInMinutes(new Date(), parseISO(e.timestamp)) <= maxage)
        .sort((e1, e2) => e2.picks - e1.picks)

      const starlistData = await context.$http.$get(context.$config.apiUrl + '/api/events/active')
        .catch(() => ({ current: [], upcoming: [] })) as CurrentAndUpcomingEvents
      starlistData.current.forEach(s => {
        const match = lastEvents.find(e => e.battle_event_id.toString() == s.id)
        if (match) {
          match.start = s.start
          match.end = s.end
        }
      })

      return lastEvents
    },
    async queryAllModes() {
      const modes = await this.query<{ battle_event_mode: string }>('all.modes', 'map',
        ['battle_event_mode'],
        ['battle_event_mode'],
        { trophy_season_end: ['month'] },
        { sort: { picks: 'desc' }, cache: 60*60 })
      return modes.data.map(row => row.battle_event_mode)
    },
    async queryAllMaps(mode?: string) {
      const maps = await this.query<{ battle_event_map: string, battle_event_id: number }>('all.maps', 'map',
        ['battle_event_map'],
        ['battle_event_map', 'battle_event_id'],
        {
          trophy_season_end: ['month'],
          ...(mode != undefined ? {
            battle_event_mode: [mode],
          } : {})
        },
        { sort: { picks: 'desc' }, cache: 60*60 })
      return maps.data
    },
    async queryAllBrawlers() {
      const brawlers = await this.query<{ brawler_name: string }>('all.brawlers', 'map',
        ['brawler_name'],
        ['brawler_name'],
        { trophy_season_end: ['month'] },
        { sort: { picks: 'desc' }, cache: 60*60 })
      return brawlers.data.map(b => b.brawler_name)
    },
    describeSlices(slices: Record<string, string[]>, timestamp?: string) {
      let description: string[] = []

      const powerplay = 'battle_event_powerplay' in slices && slices.battle_event_powerplay[0] == 'true'

      if ('battle_event_mode' in slices) {
        let mapName = formatMode(slices.battle_event_mode[0])
        if ('battle_event_map' in slices) {
          mapName += ' - ' + slices.battle_event_map[0]
        }
        if (powerplay) {
          mapName += ' (Power Play)'
        }
        description.push(mapName)
      } else {
        if (powerplay) {
          description.push('Power Play')
        }
      }

      if ('brawler_trophyrange' in slices) {
        let trophyName = ''
        if (slices.brawler_trophyrange[0] == '0' && slices.brawler_trophyrange[1] == '10') {
          trophyName = 'all '
        } else {
          const lower = slices.brawler_trophyrange[0] + '00'
          const upper = slices.brawler_trophyrange[1] == '10' ? '+' : ('-' + slices.brawler_trophyrange[1] + '00')
          trophyName = lower + upper + ' '
        }
        trophyName += powerplay ? 'Points' : 'Trophies'
        description.push(trophyName)
      }

      const seasonDescription = {
        balance: 'update',
        month: 'month',
        season: 'season',
      }
      if ('trophy_season_end' in slices && slices.trophy_season_end[0] in seasonDescription) {
        description.push('current ' + seasonDescription[slices.trophy_season_end[0]])
      }

      if (timestamp != undefined) {
        description.push('created ' + parseISO(timestamp).toLocaleDateString())
      }

      return description.join(', ')
    },
    async calculateBayesSynergies(tag: string, brawler?: string, limit?: number) {
      const slices = {
        trophy_season_end: ['month'],
      }

      // H(ally_brawler,brawler)
      const pairData = await this.query(tag, 'synergy',
        ['brawler_name', 'ally_brawler_name'],
        ['wins', 'picks'],
        {
          ...slices,
          ...(brawler == undefined ? {} : { brawler_name: [brawler.toUpperCase()] }),
        },
        {
          cache: 60*60,
          sort: { wins: 'desc' },
          limit,
        })
      // H(brawler) and H
      const data = await this.query(tag, 'map',
        ['brawler_name'],
        ['wins', 'picks', 'timestamp'],
        slices,
        {
          cache: 60*60,
          totals: true,
        })

      const totalSampleSize = data.totals!.picks
      const totalTimestamp = data.totals!.timestamp

      // H(ally_brawler,brawler)
      const pairMap = new Map<string, Map<string, PicksWins>>()
      pairData.data.forEach((row) => {
        if (!pairMap.has(row.brawler_name)) {
          pairMap.set(row.brawler_name, new Map<string, PicksWins>())
        }
        pairMap.get(row.brawler_name)!.set(row.ally_brawler_name, {
          picks: row.picks,
          wins: row.wins,
        })
      })
      // H(brawler)
      const dataMap = new Map<string, PicksWins>()
      data.data.forEach((row) => dataMap.set(row.brawler_name, row))
      // H
      const totals: PicksWins = {
        picks: data.totals!.picks,
        wins: data.totals!.wins,
      }

      return {
        totals,
        data: dataMap,
        pairData: pairMap,
        sampleSize: totalSampleSize,
        timestamp: totalTimestamp,
      }
    },
    constructQuery(dimensions, measurements, slices, slicesValues, metaColumns) {
      // TODO filter duplicates
      const queryDimensions = dimensions.map(d => d.column)
      const queryMeasurements = <string[]>[]

      metaColumns.forEach(c => queryMeasurements.push(c))
      measurements.forEach(m => {
        queryMeasurements.push(m.column)
        if ('anyColumns' in m) {
          // m is actually a dimension
          (<Dimension>m).anyColumns
            .forEach(c => queryMeasurements.push(c))
        }
      })

      dimensions.forEach(d => d.anyColumns
        .forEach(c => queryMeasurements.push(c)))

      const querySlices = Object.fromEntries(Object.entries(slicesValues)
        .filter(([key, value]) => {
          if (!Array.isArray(value)) {
            throw new Error('Illegal slice specification! ' + key + ': ' + value)
          }
          return value.length > 0 && value[0] != undefined
        })
        .map(([key, value]) => {
          const slice = slices.find(s => s.id == key)
          if (slice == undefined) {
            throw new Error('Undefined slice ' + key)
          }
          return [slice.column, value]
        })
      )

      return {
        dimensions: queryDimensions,
        measurements: queryMeasurements,
        slices: querySlices,
      }
    },
    mapToMetaGridEntry(dimensions, measurements, rows, totals, metaColumns) {
      return rows.map(row => {
        const entry: MetaGridEntry = {
          id: '',
          dimensionsRaw: {},
          dimensions: {},
          measurementsRaw: {},
          measurements: {},
          meta: {},
        }

        for (const m of metaColumns) {
          entry.meta[m] = row[m]
        }

        const anyDimensions: Dimension[] = []
        for (const m of measurements) {
          if ('percentage' in m) {
            // m is a measurement
            const measurement = m.percentage ? row[m.column] / totals![m.column] : row[m.column]
            entry.measurementsRaw[m.id] = measurement
            entry.measurements[m.id] = this.format(m, measurement)
          } else {
            // m is a dimension
            anyDimensions.push(m)
          }
        }

        let id = ''
        for (const d of dimensions.concat(anyDimensions)) {
          const dimension = d.anyColumns
            .concat(d.column)
            .reduce((o, c) => ({ ...o, [c]: row[c] }), {}) // pick keys from row
          entry.dimensionsRaw[d.id] = dimension
          const formatted = this.format(d, dimension[d.formatColumn])
          entry.dimensions[d.id] = formatted
          id += formatted
        }
        entry.id = id

        return entry
      })
    },
    compareEntries(baseEntries: MetaGridEntry[], comparingEntries: MetaGridEntry[], mode) {
      return comparingEntries
        .map(comparingEntry => {
          // use startsWith instead of eq to allow comparisons across hierarchy levels
          const baseEntry = baseEntries.find(b => comparingEntry.id.startsWith(b.id))
          if (baseEntry == undefined) {
            return undefined
          }
          const measurementsRaw: Record<string, number|string> = {}
          const measurements: Record<string, string> = {}

          for (const m in baseEntry.measurements) {
            if (mode == 'diff') {
              measurementsRaw[m] = (comparingEntry.measurementsRaw[m] as number) - (baseEntry.measurementsRaw[m] as number)
              measurements[m] = (measurementsRaw[m] > 0 ? '+' : '') + this.format(commonMeasurements[m], measurementsRaw[m])
            }

            // TODO implement z-test again
            /*
            if (mode == 'test') {
              // perform a Gauss test using normal approximation
              // TODO quite a hack because most attributes aren't even binomial...
              // TODO get the variances directly, then evaluate t-test or welch-test
              // TODO requires picks... logic should be moved elsewhere

              const zN = comparingEntry.meta.picks as number
              const zX = comparingEntry.measurementsRaw[m]
              const zP = baseEntry.measurementsRaw[m] / (baseEntry.meta.picks as number)
              const zCondition = zN >= 50 && zN * zP > 5 && zN * (1 - zP) > 5
              if (zCondition) {
                measurementsRaw[m] = (zX - zN * zP) / Math.sqrt(zN * zP * (1 - zP))
              } else {
                measurementsRaw[m] = 0
              }
              measurements[m] = measurementsRaw[m].toFixed(2)
            }
            */
          }

          return {
            ...comparingEntry,
            measurementsRaw,
            measurements,
          }
        })
      .filter(e => e != undefined) as MetaGridEntry[]
    },
    stateToLocation(state: Partial<State>): Location {
      const slices = state.slices ? generateQueryParams(state.slices, 'filter') : {}
      const comparingSlices = state.comparing && state.comparingSlices ? generateQueryParams(state.comparingSlices, 'compareFilter') : {}

      const query = Object.assign({}, {
          cube: state.cubeId,
          dimension: state.dimensionsIds,
          metric: state.measurementsIds,
          compare: state.comparing ? true : undefined,
          sort: state.sortId,
        }, slices, comparingSlices
      )

      return { path: '/dashboard', query }
    },
    locationToState(location: Route, config: Config): State|undefined {
      if (location.query == undefined) {
        return undefined
      }

      const cubeId = location.query.cube as string || 'map'
      let slices = parseQueryParams(location.query, 'filter')
      slices = Object.assign({}, config[cubeId].defaultSliceValues, slices)

      let comparingSlices = parseQueryParams(location.query, 'compareFilter')
      comparingSlices = Object.assign({}, config[cubeId].defaultSliceValues, comparingSlices)

      let dimensionsIds = location.query.dimension || config[cubeId].defaultDimensionsIds
      if (typeof dimensionsIds == 'string') {
        dimensionsIds = [dimensionsIds]
      }

      let measurementsIds = location.query.metric || config[cubeId].defaultMeasurementIds
      if (typeof measurementsIds == 'string') {
        measurementsIds = [measurementsIds]
      }

      const comparing = location.query.compare != undefined

      const sortId = location.query.sort || measurementsIds[0]

      return {
        cubeId,
        slices,
        comparingSlices,
        dimensionsIds,
        measurementsIds,
        comparing,
        sortId,
      } as State
    },
    format(spec, value) {
      if (Array.isArray(value)) {
        return value.map(v => this.format(spec, v)).join(', ')
      }
      if (spec.type == 'quantitative' && typeof value == 'number') {
        if (spec.formatter == 'duration') {
          return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`
        }
        return d3format.format(spec.formatter)(value)
      }
      if (spec.type == 'temporal' && typeof value == 'string') {
        return formatDate(parseISO(value), spec.formatter)
      }
      if (spec.type == 'nominal' && typeof value == 'string') {
        if (spec.formatter == 'capitalizeWords') {
          return capitalizeWords(value.toLowerCase())
        }
        if (spec.formatter == 'y/n') {
          return value == '1' ? 'Yes' : 'No'
        }
        if (spec.formatter == 'formatMode') {
          // TODO remove for i18n
          return formatMode(value)
        }
        return value
      }
      return value.toString()
    }
  })
}

export default plugin
