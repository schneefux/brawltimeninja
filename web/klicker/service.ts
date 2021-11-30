import { Config, Cube, Dimension, Measurement, MetaGridEntry, SliceValue, State, ValueType, CubeResponse } from "~/klicker"
import cubejs, { CubejsApi, Filter, ResultSet, TQueryOrderObject } from "@cubejs-client/core"
import * as d3format from "d3-format"
import { format as formatDate, parseISO } from "date-fns"
import { Route, Location } from "vue-router"
import { capitalizeWords } from "~/lib/util"

// TODO refactor clicker -> move all functions into here

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

function generateQueryParams(o: Record<string, (string|number|undefined)[]>, prefix: string): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(o)
      .filter(([key, value]) => value != undefined)
      .map(([key, value]) => [prefix + '[' + key + ']', safeEncode(value)])
  )
}

export default class Klicker {
  private cubejsApi: CubejsApi

  constructor(cubeUrl: string, public config: Config) {
    this.cubejsApi = cubejs('', { apiUrl: cubeUrl + '/cubejs-api/v1' })
  }

  public $t(key: string) {
    // override with vue-i18n
    return key
  }

  public $te(key: string) {
    // override with vue-i18n
    return false
  }

  public async query(state: State): Promise<CubeResponse> {
    if (!(state.cubeId in this.config)) {
      throw 'Invalid cubeId ' + state.cubeId
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
            values: (<string[]>values.filter(v => v != undefined)).map(v => {
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

    const rawData = await this.cubejsApi.load({
      measures: queryMeasures,
      dimensions: queryDimensions,
      filters: querySlices,
      order: queryOrder,
      limit: state.limit,
    })

    let data = this.mapToMetaGridEntry(cube, dimensions, measurements, rawData)

    // TODO refactor this - remove comparison mode from query level and move it to visualisation level
    if (state.comparingSlices != undefined) {
      const queryComparingSlices = mapSlices(state.comparingSlices)

      const comparingRawData = await this.cubejsApi.load({
        measures: queryMeasures,
        dimensions: queryDimensions,
        filters: queryComparingSlices,
        order: queryOrder,
        limit: state.limit,
      })

      const comparingData = this.mapToMetaGridEntry(cube, dimensions, measurements, comparingRawData)

      // in case the comparison is 1:m (comparing across hierarchy levels), make visualisations iterate over the m
      let [left, right] = (data.length > comparingData.length) ? [comparingData, data] : [data, comparingData]

      if (sortMeasurement != undefined) {
        data = this.compareEntries(cube, left, right, 'diff')
          .sort((e1, e2) => sortMeasurement.sign * ((e1.measurementsRaw[sortMeasurement.id] as number) - (e2.measurementsRaw[sortMeasurement.id] as number)))
      }
      if (sortDimension != undefined) {
        data = this.compareEntries(cube, left, right, 'diff')
          .sort((e1, e2) => (e1.dimensions[sortDimension.id].localeCompare(e2.dimensions[sortDimension.id])))
      }
    }

    return {
      state,
      comparing: state.comparingSlices != undefined,
      measurements,
      dimensions,
      data,
    }
  }
  private mapToMetaGridEntry(cube: Cube, dimensions: Dimension[], measurements: Measurement[], resultSet: ResultSet): MetaGridEntry[] {
    // TODO consider refactoring to store it column-based (object of arrays) for performance
    const table = resultSet.rawData()

    // transform raw data to entries
    const entries = table.map(row => {
      const measurementsRaw: MetaGridEntry['measurementsRaw'] = {}
      for (const m of measurements) {
        const id = cube.id + '.' + m.id + '_measure'
        // parse strings as float (cube.js clickhouse driver bug)
        const value = m.type == 'quantitative' ? parseFloat(row[id] as string) : row[id]
        measurementsRaw[m.id] = value
      }

      const dimensionsRaw: MetaGridEntry['dimensionsRaw'] = {}
      let id = ''
      for (const d of dimensions) {
        const keys = d.additionalMeasures
          .map(m => m + '_measure')
          .concat(d.id + '_dimension')

        dimensionsRaw[d.id] = {}
        for (const k of keys) {
          const kShort = k.replace(/_measure|_dimension/g, '')
          dimensionsRaw[d.id][kShort] = row[cube.id + '.' + k]
        }
        const naturalId = dimensionsRaw[d.id][d.naturalIdAttribute]
        if (naturalId == undefined) {
          throw new Error('Invalid natural id ' + d.naturalIdAttribute + ' for dimension ' + d.id)
        }
        const formatted = this.format(d, naturalId)
        dimensions[d.id] = formatted
        id += `${d.id}=${naturalId};`
      }

      return <MetaGridEntry>{
        id,
        measurementsRaw,
        dimensionsRaw,
        measurements: {},
        dimensions: {},
      }
    })

    // apply custom transformations
    for (const m of measurements) {
      if (m.transform != undefined) {
        const newValues = m.transform(entries)
        entries.forEach((row, i) => row.measurementsRaw[m.id] = newValues[i])
      }
    }

    // apply formatters
    entries.forEach(entry => {
      for (const m of measurements) {
        entry.measurements[m.id] = this.format(m, entry.measurementsRaw[m.id])
      }

      for (const d of dimensions) {
        const naturalId = entry.dimensionsRaw[d.id][d.naturalIdAttribute]
        const formatted = this.format(d, naturalId)
        entry.dimensions[d.id] = formatted
      }
    })

    return entries
  }
  public format(spec: { type: ValueType, formatter?: string }, value: number|string|string[]): string {
    if (Array.isArray(value)) {
      return value.map(v => this.format(spec, v)).join(', ')
    }
    if (spec.type == 'quantitative' && typeof value == 'number') {
      if (spec.formatter == 'duration') {
        return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`
      }
      return d3format.format(spec.formatter ?? '')(value)
    }
    if (spec.type == 'temporal' && typeof value == 'string') {
      if (spec.formatter == undefined) {
        throw new Error('No formatter specified for temporal')
      }
      return formatDate(parseISO(value), spec.formatter)
    }
    if (spec.type == 'nominal' && typeof value == 'string') {
      if (spec.formatter == 'capitalizeWords') {
        return capitalizeWords(value.toLowerCase())
      }
      if (spec.formatter == 'y/n') {
        return value == '1' ? 'Yes' : 'No'
      }
    }
    return value.toString()
  }
  private compareEntries(cube: Cube, baseEntries: MetaGridEntry[], comparingEntries: MetaGridEntry[], mode: 'diff'|'test'): MetaGridEntry[] {
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
            const index = cube.measurements.findIndex(mm => mm.id == m)
            measurements[m] = (measurementsRaw[m] > 0 ? '+' : '') + this.format(cube.measurements[index], measurementsRaw[m])
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
  }
  public getName(m: Measurement|Dimension, modifier?: string): string {
    const i18nKey = 'metric.' + m.id + (modifier != undefined ? '.' + modifier : '')

    if (this.$te(i18nKey)) {
      return this.$t(i18nKey) as string
    }

    // fall back to name
    return m.name || m.id
  }
  public stateToLocation(state: Partial<State>): Location {
    const slices = state.slices ? generateQueryParams(state.slices, 'filter') : {}
    const comparingSlices = state.comparingSlices ? generateQueryParams(state.comparingSlices, 'compareFilter') : {}

    const query = Object.assign({}, {
      cube: state.cubeId,
      dimension: state.dimensionsIds,
      metric: state.measurementsIds,
      compare: state.comparingSlices ? true : undefined,
      sort: state.sortId,
    }, slices, comparingSlices)

    return { query }
  }
  locationToState(location: Route, config: Config, defaultCubeId: string): State {
    const query = location.query || {}

    const cubeId = query.cube as string || defaultCubeId
    let slices = parseQueryParams(query, 'filter') as SliceValue
    slices = Object.assign({}, config[cubeId].defaultSliceValues, slices)

    const comparing = query.compare != undefined
    let comparingSlices = parseQueryParams(query, 'compareFilter') as SliceValue|undefined
    comparingSlices = comparing ? Object.assign({}, config[cubeId].defaultSliceValues, comparingSlices) : undefined

    let dimensionsIds = query.dimension as string[] || config[cubeId].defaultDimensionsIds
    if (typeof dimensionsIds == 'string') {
      dimensionsIds = [dimensionsIds]
    }

    let measurementsIds = query.metric as string[] || config[cubeId].defaultMeasurementIds
    if (typeof measurementsIds == 'string') {
      measurementsIds = [measurementsIds]
    }

    const sortId = query.sort as string || measurementsIds[0]

    return {
      cubeId,
      slices,
      comparingSlices,
      dimensionsIds,
      measurementsIds,
      sortId,
    }
  }
}
