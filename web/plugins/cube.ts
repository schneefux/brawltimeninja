import { Plugin } from "@nuxt/types"
import config, { Config, Dimension, Measurement, State } from "~/lib/cube"
import { MetaGridEntry } from "~/lib/util"

// TODO refactor clicker -> move functions into here

export interface CubeResponse {
  dimensions: Dimension[]
  measurements: Measurement[]
  data: MetaGridEntry[]
}

interface Cube {
  config: Config // TODO move plugin to module, make this configurable
  query(state: State, limit?: number, includeMeta?: boolean): Promise<CubeResponse>
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
  inject('cube', <Cube>{
    config,
    async query(state, limit = undefined, includeMeta = false) {
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
      const sortColumn = sortMeasurement?.column || sortDimension?.column
      if (sortColumn == undefined) {
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

      const needTotals = measurements.some(m => m.percentage)

      const query = context.$clicker.constructQuery(dimensions, measurements, this.config[state.cubeId].slices, {
        ...cube.defaultSliceValues,
        ...state.slices,
      }, includeMeta ? cube.metaColumns : [])
      const rawData = await context.$clicker.query('meta.' + state.cubeId, state.cubeId,
        query.dimensions,
        query.measurements,
        query.slices, {
          ...(sortColumn != undefined ? {
            sort: { [sortColumn]: 'desc' },
          } : {}),
          cache: 60*30,
          limit,
          totals: needTotals,
        })

      let data = context.$clicker.mapToMetaGridEntry(dimensions, measurements, rawData.data, rawData.totals || {}, includeMeta ? cube.metaColumns : [])

      // TODO refactor this - remove comparison mode from query level and move it to visualisation level
      if (state.comparing) {
        const query = context.$clicker.constructQuery(dimensions, measurements, this.config[state.cubeId].slices, {
          ...cube.defaultSliceValues,
          ...state.comparingSlices,
        }, includeMeta ? cube.metaColumns : [])
        const comparingRawData = await context.$clicker.query('meta.' + state.cubeId, state.cubeId,
          query.dimensions,
          query.measurements,
          query.slices, {
            ...(sortColumn != undefined ? {
              sort: { [sortColumn]: 'desc' },
            } : {}),
            cache: 60*30,
            limit,
            totals: needTotals,
          })

        const comparingData = context.$clicker.mapToMetaGridEntry(dimensions, measurements, comparingRawData.data, comparingRawData.totals || {}, includeMeta ? cube.metaColumns : [])

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
  })
}

export default plugin
