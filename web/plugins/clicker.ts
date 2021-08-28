import { parseISO, format as formatDate } from "date-fns"
import { capitalizeWords, formatMode, idToTag, MetaGridEntry } from "~/lib/util"
import { Route, Location } from "vue-router"
import { State, Config, commonMeasurements, Dimension, Measurement, ValueType, Cube } from "~/lib/cube"
import * as d3format from "d3-format"
import { Plugin } from "@nuxt/types"
import { ResultSet } from "@cubejs-client/core"

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
      .filter(([key, value]) => value != undefined)
      .map(([key, value]) => [prefix + '[' + key + ']', safeEncode(value)])
  )
}

export interface PicksWins {
  picks: number
  wins: number
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
  mapToMetaGridEntry(cube: Cube, dimensions: Dimension[], measurements: Measurement[], resultSet: ResultSet, metaColumns?: string[]): MetaGridEntry[]
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
    async query(name, cube, dimensions, measures, slices, options = {}) {
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
    describeSlices(slices: Record<string, string[]>, timestamp?: string) {
      let description: string[] = []

      const powerplay = 'battle_event_powerplay' in slices && slices.battle_event_powerplay[0] == 'true'

      if ('battle_event_mode' in slices) {
        let mapName = formatMode(slices.battle_event_mode[0])
        if ('battle_event_map' in slices) {
          mapName += ' - ' + slices.battle_event_map[0]
        }
        if (powerplay) {
          mapName += ' (Power League)'
        }
        description.push(mapName)
      } else {
        if (powerplay) {
          description.push('Power League')
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
    mapToMetaGridEntry(cube, dimensions, measurements, resultSet, metaColumns = []) {
      const totals: Record<string, Record<string, number>> = {}
      const table = resultSet.tablePivot()

      const rowIdWithout = (percentageOver: string, row: Record<string, string | number | boolean>) => dimensions
        .filter(d => d.id != percentageOver)
        .map(d => {
          const keyId = cube.id + '.' + d.naturalIdAttribute + '_dimension'
          if (!(keyId in row)) {
            throw new Error('Invalid percentageOver specification, cannot find ' + keyId)
          }
          return row[keyId]
        }).join('-')

      for (const m of measurements) {
        if (m.percentageOver) {
          // totals = sum($m.id) group by every dimenison except $m.percentageOver
          const total: Record<string, number> = {}

          for (const row of table) {
            const key = rowIdWithout(m.percentageOver, row)
            const valueId = cube.id + '.' + m.id + '_measure'

            if (!(key in total)) {
              total[key] = 0
            }
            total[key] += parseFloat(row[valueId] as string)
          }

          totals[m.percentageOver] = total
        }
      }

      return table.map(row => {
        const entry: MetaGridEntry = {
          id: '',
          dimensionsRaw: {},
          dimensions: {},
          measurementsRaw: {},
          measurements: {},
          meta: {},
        }

        for (const m of metaColumns) {
          entry.meta[m] = row[cube.id + '.' + m + '_measure'] as string
        }

        const getValue = (m: Measurement) => {
          const id = cube.id + '.' + m.id + '_measure'

          if (m.type != 'quantitative') {
            return row[id] as string
          }

          // ! cube.js clickhouse driver formats everything as strings
          const value = parseFloat(row[id] as string)
          if (m.percentageOver) {
            const key = rowIdWithout(m.percentageOver, row)
            const total = totals[m.percentageOver][key]
            return value / total
          } else {
            return value
          }
        }

        for (const m of measurements) {
          const value = getValue(m)
          entry.measurements[m.id] = this.format(m, value)
          entry.measurementsRaw[m.id] = value
        }

        let id = ''
        for (const d of dimensions) {
          const dimension = d.additionalMeasures
            .map(m => m + '_measure')
            .concat(d.id + '_dimension')
            // pick keys from row
            .reduce((o, c) => ({
              ...o,
              [c.replace(/_measure|_dimension/g, '')]: row[cube.id + '.' + c],
            }), {})
          entry.dimensionsRaw[d.id] = dimension
          const naturalId = dimension[d.naturalIdAttribute]
          if (naturalId == undefined) {
            throw new Error('Invalid natural id ' + d.naturalIdAttribute + ' for dimension ' + d.id)
          }
          const formatted = this.format(d, naturalId)
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
      const comparingSlices = state.comparingSlices ? generateQueryParams(state.comparingSlices, 'compareFilter') : {}

      const query = Object.assign({}, {
        cube: state.cubeId,
        dimension: state.dimensionsIds,
        metric: state.measurementsIds,
        compare: state.comparingSlices ? true : undefined,
        sort: state.sortId,
      }, slices, comparingSlices)

      return { path: '/dashboard', query }
    },
    locationToState(location: Route, config: Config): State|undefined {
      if (location.query == undefined) {
        return undefined
      }

      const cubeId = location.query.cube as string || 'map'
      let slices = parseQueryParams(location.query, 'filter')
      slices = Object.assign({}, config[cubeId].defaultSliceValues, slices)

      const comparing = location.query.compare != undefined
      let comparingSlices: object|undefined = parseQueryParams(location.query, 'compareFilter')
      comparingSlices = comparing ? Object.assign({}, config[cubeId].defaultSliceValues, comparingSlices) : undefined

      let dimensionsIds = location.query.dimension || config[cubeId].defaultDimensionsIds
      if (typeof dimensionsIds == 'string') {
        dimensionsIds = [dimensionsIds]
      }

      let measurementsIds = location.query.metric || config[cubeId].defaultMeasurementIds
      if (typeof measurementsIds == 'string') {
        measurementsIds = [measurementsIds]
      }

      const sortId = location.query.sort || measurementsIds[0]

      return <State>{
        cubeId,
        slices,
        comparingSlices,
        dimensionsIds,
        measurementsIds,
        sortId,
      }
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
        if (spec.formatter == 'idToTag') {
          return idToTag(value)
        }
        return value
      }
      return value.toString()
    }
  })
}

export default plugin
