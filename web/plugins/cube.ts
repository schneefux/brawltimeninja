import { Plugin } from "@nuxt/types"
import config, { Config, Dimension, Measurement, SliceValue, State } from "~/lib/cube"
import { getCurrentSeasonEnd, MetaGridEntry } from "~/lib/util"
import cubejs, { CubejsApi, Filter, TQueryOrderObject } from "@cubejs-client/core"
import { differenceInMinutes, parseISO, subWeeks, format as formatDate } from "date-fns"
import { Slices } from "./clicker"
import { CurrentAndUpcomingEvents } from "~/model/Api"

// TODO refactor clicker -> move functions into here

export interface CubeResponse {
  dimensions: Dimension[]
  measurements: Measurement[]
  data: MetaGridEntry[]
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

interface Cube {
  cubejsApi: CubejsApi
  config: Config // TODO move plugin to module, make this configurable
  query(state: State, limit?: number): Promise<CubeResponse>
  queryActiveEvents(): Promise<EventMetadata[]>,
  queryActiveEvents<T extends EventMetadata>(measures: string[], slices: Slices, maxage: number): Promise<T[]>,
  queryAllModes(): Promise<string[]>
  queryAllMaps(mode?: string): Promise<{ battle_event_map: string, battle_event_id: number }[]>
  queryAllBrawlers(): Promise<string[]>
  queryAllSeasons(limitWeeks: number): Promise<{ id: string, name: string }[]>
}

declare module 'vue/types/vue' {
  interface Vue {
    $cube: Cube
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $cube: Cube
  }
  interface Context {
    $cube: Cube
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $cube: Cube
  }
}

const plugin: Plugin = (context, inject) => {
  const cubejsApi = cubejs('', { apiUrl: context.$config.cubeUrl + '/cubejs-api/v1' })

  inject('cube', <Cube>{
    cubejsApi,
    config,
    async query(state, limit = undefined) {
      if (!(state.cubeId in this.config)) {
        console.error('Invalid cubeId ' + state.cubeId)
        return
      }

      const cube = this.config[state.cubeId]
      // sort-id may either refer to a measurement or a dimension
      const sortMeasurement = cube.measurements
        .find(m => state.sortId == m.id)
      const sortDimension = cube.dimensions
        .find(d => state.sortId == d.id)
      if (sortMeasurement == undefined && sortDimension == undefined) {
        throw new Error('Invalid sort id ' + state.sortId)
      }
      const dimensions = state.dimensionsIds
        .map(id => {
          const dimension = cube.dimensions.find(d => id == d.id)
          if (dimension == undefined) throw new Error('Invalid dimension id ' + id)
          return dimension
        })
      const measurements = state.measurementsIds
        .map(id => {
          const measurement = cube.measurements.find(d => id == d.id)
          if (measurement == undefined) throw new Error('Invalid measurements id ' + id)
          return measurement
        })

      function mapSlices(slices: SliceValue) {
        return Object.entries({
            ...cube.defaultSliceValues,
            ...slices,
          })
          .filter(([id, values]) => values.filter(v => v != undefined).length > 0)
          .map(([id, values]) => {
            const slice = cube.slices.find(s => s.id == id)
            if (slice == undefined) {
              throw new Error('Could not find slice ' + id + ' in cube ' + cube.id)
            }
            const config = slice.config
            return <Filter>{
              member: cube.id + '.' + config.member,
              operator: config.operator,
              values: values.filter(v => v != undefined).map(v => {
                // TODO fix typing - these are not always strings (templates are not type checked)
                if (v.toString() == 'true') {
                  return '1'
                }
                if (v.toString() == 'false') {
                  return '0'
                }
                return v.toString()
              }),
            }
          })
      }

      const queryMeasures = (<string[]>[]).concat(
        measurements.map(m => cube.id + '.' + m.id + '_measure'),
        ...dimensions.map(d => d.additionalMeasures.map(m => cube.id + '.' + m + '_measure')),
      )
      const queryDimensions = dimensions.map(d => cube.id + '.' + d.id + '_dimension')

      const queryOrder = sortMeasurement ? <TQueryOrderObject>{
        [cube.id + '.' + sortMeasurement.id + '_measure']: sortMeasurement.sign == +1 ? 'asc' : 'desc',
      } : <TQueryOrderObject>{
        [cube.id + '.' + sortDimension!.id + '_dimension']: 'desc',
      }

      const querySlices = mapSlices(state.slices)

      const rawData = await cubejsApi.load({
        measures: queryMeasures,
        dimensions: queryDimensions,
        filters: querySlices,
        order: queryOrder,
        limit,
      })

      let data = context.$clicker.mapToMetaGridEntry(cube, dimensions, measurements, rawData)

      // TODO refactor this - remove comparison mode from query level and move it to visualisation level
      if (state.comparingSlices != undefined) {
        const queryComparingSlices = mapSlices(state.comparingSlices)

        const comparingRawData = await cubejsApi.load({
          measures: queryMeasures,
          dimensions: queryDimensions,
          filters: queryComparingSlices,
          order: queryOrder,
          limit,
        })

        const comparingData = context.$clicker.mapToMetaGridEntry(cube, dimensions, measurements, comparingRawData, [])

        // in case the comparison is 1:m (comparing across hierarchy levels), make visualisations iterate over the m
        let [left, right] = (data.length > comparingData.length) ? [comparingData, data] : [data, comparingData]

        if (sortMeasurement != undefined) {
          data = context.$clicker.compareEntries(left, right, 'diff')
            .sort((e1, e2) => sortMeasurement.sign * ((e1.measurementsRaw[sortMeasurement.id] as number) - (e2.measurementsRaw[sortMeasurement.id] as number)))
        }
        if (sortDimension != undefined) {
          data = context.$clicker.compareEntries(left, right, 'diff')
            .sort((e1, e2) => (e1.dimensions[sortDimension.id].localeCompare(e2.dimensions[sortDimension.id])))
        }
      }

      return {
        measurements,
        dimensions,
        data,
      }
    },
    async queryActiveEvents(measures = [], slices = {}, maxage = 60) {
      const events = await this.query({
        cubeId: 'map',
        dimensionsIds: ['mode', 'map', 'powerplay'],
        measurementsIds: ['eventId', 'timestamp', 'picks', ...measures],
        slices: {
          season: [getCurrentSeasonEnd().toISOString().slice(0, 10)],
          ...slices,
        },
        sortId: 'timestamp',
      }, 10)

      const lastEvents = events.data
        .map(e => (<EventMetadata>{
          battle_event_id: parseInt(e.measurementsRaw.eventId as string),
          battle_event_map: e.dimensionsRaw.map.map as string,
          battle_event_mode: e.dimensionsRaw.mode.mode as string,
          battle_event_powerplay: e.dimensionsRaw.powerplay.powerplay == '1',
          picks: e.measurementsRaw.picks as number,
          timestamp: e.measurementsRaw.timestamp as string,
          ...(measures.reduce((agg, m) => ({
            ...agg,
            [m]: e.measurementsRaw[m],
          }), {})),
        }))
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
    async queryAllSeasons(limitWeeks = 8) {
      const limit = subWeeks(new Date(), limitWeeks)

      const data = await this.query({
        cubeId: 'map',
        dimensionsIds: ['season'],
        measurementsIds: [],
        slices: {
          season: [limit.toISOString().slice(0, 10)],
        },
        sortId: 'season',
      })

      return data.data
        .map(e => {
          const d = parseISO(e.dimensionsRaw.season.season)
          return {
            id: d.toISOString().slice(0, 10),
            name: formatDate(subWeeks(d, 2), 'PP') // seasons last 2 weeks
          }
        })
        .sort((e1, e2) => e1.id.localeCompare(e2.id))
        .reverse()
    },
    async queryAllModes() {
      const modes = await this.query({
        cubeId: 'map',
        dimensionsIds: ['mode'],
        measurementsIds: [],
        slices: {
          season: [getCurrentSeasonEnd().toISOString().slice(0, 10)],
        },
        sortId: 'picks',
      })
      return modes.data.map(row => row.dimensionsRaw.mode.mode)
    },
    async queryAllMaps(mode?: string) {
      const maps = await this.query({
        cubeId: 'map',
        dimensionsIds: ['map'],
        measurementsIds: ['eventId'],
        slices: {
          season: [getCurrentSeasonEnd().toISOString().slice(0, 10)],
          ...(mode != undefined ? {
            mode: [mode],
          } : {}),
        },
        sortId: 'picks',
      })
      return maps.data.map(e => ({
        battle_event_id: e.measurementsRaw.eventId,
        battle_event_map: e.dimensionsRaw.map.map,
      }))
    },
    async queryAllBrawlers() {
      const brawlers = await this.query({
        cubeId: 'map',
        dimensionsIds: ['brawler'],
        measurementsIds: [],
        slices: {
          season: [getCurrentSeasonEnd().toISOString().slice(0, 10)],
        },
        sortId: 'picks',
      })
      return brawlers.data.map(b => b.dimensionsRaw.brawler.brawler)
    },
  })
}

export default plugin
