import { Config, Cube, Dimension, Measurement, MetaGridEntry, SliceValue, CubeQuery, ValueType, CubeResponse, CubeComparingQuery, CubeComparingResponse, MetaGridEntryDiff, AbstractCubeQuery, ComparingMetaGridEntry } from "~/klicker"
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

  public async query(query: CubeQuery): Promise<CubeResponse> {
    if (!(query.cubeId in this.config)) {
      throw 'Invalid cubeId ' + query.cubeId
    }

    const cube = this.config[query.cubeId]
    // sort-id may either refer to a measurement or a dimension
    const sortMeasurement = cube.measurements
      .find(m => query.sortId == m.id)
    const sortDimension = cube.dimensions
      .find(d => query.sortId == d.id)
    if (sortMeasurement == undefined && sortDimension == undefined) {
      throw new Error('Invalid sort id ' + query.sortId)
    }
    const dimensions = query.dimensionsIds
      .map(id => {
        const dimension = cube.dimensions.find(d => id == d.id)
        if (dimension == undefined) throw new Error('Invalid dimension id ' + id)
        return dimension
      })
    const measurements = query.measurementsIds
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
        .filter(([id, values]) => {
          if (!Array.isArray(values)) {
            throw new Error('Slice ' + id + ' must be an array')
          }
          return values.filter(v => v != undefined).length > 0
        })
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

    const querySlices = mapSlices(query.slices)

    const rawData = await this.cubejsApi.load({
      measures: queryMeasures,
      dimensions: queryDimensions,
      filters: querySlices,
      order: queryOrder,
      limit: query.limit,
    })

    let data = this.mapToMetaGridEntry(cube, dimensions, measurements, rawData)

    /*
    // TODO refactor this - remove comparison mode from query level and move it to visualisation level
    if (query.comparingSlices != undefined) {
      const queryComparingSlices = mapSlices(query.comparingSlices)

      const comparingRawData = await this.cubejsApi.load({
        measures: queryMeasures,
        dimensions: queryDimensions,
        filters: queryComparingSlices,
        order: queryOrder,
        limit: query.limit,
      })

      const comparingData = this.mapToMetaGridEntry(cube, dimensions, measurements, comparingRawData)

      // in case the comparison is 1:m (comparing across hierarchy levels), make visualisations iterate over the m
      let [left, right] = (data.length > comparingData.length) ? [comparingData, data] : [data, comparingData]

      if (sortMeasurement != undefined) {
        data = this.compareEntries(cube, left, right)
          .sort((e1, e2) => sortMeasurement.sign * ((e1.measurementsRaw[sortMeasurement.id] as number) - (e2.measurementsRaw[sortMeasurement.id] as number)))
      }
      if (sortDimension != undefined) {
        data = this.compareEntries(cube, left, right)
          .sort((e1, e2) => (e1.dimensions[sortDimension.id].localeCompare(e2.dimensions[sortDimension.id])))
      }
    }
    */

    return {
      kind: 'response',
      query,
      data,
    }
  }
  public async comparingQuery(query: CubeComparingQuery): Promise<CubeComparingResponse> {
    if (!query.dimensionsIds.every(d => query.dimensionsIds.includes(d))) {
      // TODO relax this condition and allow comparisons across different levels of the same hierarchy
      throw new Error('Dimensions must match')
    }

    // TODO should comparisons across different cubeIds be allowed? if not -> push cubeId up
    const referenceCube = this.config[query.reference.cubeId]
    const comparingMeasurement = referenceCube.measurements.find(m => m.id == query.measurementsIds[0])
    if (comparingMeasurement == undefined) {
      throw new Error(`Invalid comparison, missing ${query.measurementsIds[0]} in reference cube`)
    }
    const testCube = this.config[query.cubeId]
    if (!testCube.measurements.some(m => m.id == query.measurementsIds[0])) {
      throw new Error(`Invalid comparison, missing ${query.measurementsIds[0]} in test cube`)
    }
    if (comparingMeasurement.type != 'quantitative') {
      throw new Error(`Only quantitative measures can be compared, ${comparingMeasurement.id} is ${comparingMeasurement.type}`)
    }

    const measurementsIds = [query.measurementsIds[0], ...(comparingMeasurement.statistics?.requiresMeasurements || [])]
    const partialQuery = {
      measurementsIds,
      sortId: query.measurementsIds[0],
    }

    const referenceResponse = await this.query({
      cubeId: query.reference.cubeId,
      dimensionsIds: query.reference.dimensionsIds,
      slices: query.reference.slices,
      ...partialQuery,
    })
    const testResponse = await this.query({
      cubeId: query.cubeId,
      dimensionsIds: query.dimensionsIds,
      slices: query.slices,
      ...partialQuery,
    })

    return {
      ...testResponse,
      kind: 'comparingResponse',
      query,
      data: this.compare(referenceResponse.data, testResponse.data, comparingMeasurement),
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
  private compare(referenceData: MetaGridEntry[], testData: MetaGridEntry[], comparing: Measurement): ComparingMetaGridEntry[] {
    const referenceDataMap: Record<string, MetaGridEntry> = {}
    referenceData.forEach(r => referenceDataMap[r.id] = r)

    return testData
      // TODO find a better way of dealing with non-comparables (nulls)
      .filter(t => t.id in referenceDataMap)
      .map(t => {
        const reference = referenceDataMap[t.id]

        const diff = (t.measurementsRaw[comparing.id] as number) - (reference.measurementsRaw[comparing.id] as number)
        const pValue = comparing.statistics?.test(referenceDataMap[t.id], t) || 1
        // apply Bonferroni correction (TODO use method with better accuracy)
        const correctedPValue = Math.min(1.0, pValue * testData.length)

        const pStars = (pValue: number) => {
          if (pValue < 0.001) {
            return '⋆⋆⋆'
          }
          if (pValue < 0.01) {
            return '⋆⋆'
          }
          if (pValue < 0.05) {
            return '⋆'
          }
          if (pValue < 0.1) {
            return '+'
          }
          return ''
        }

        const diffFormatted = (diff > 0 ? '+' : '') + this.format(comparing, diff)
        const difference: MetaGridEntryDiff = {
          differenceRaw: diff,
          difference: diffFormatted,
          annotatedDifference: diffFormatted + ' ' + pStars(correctedPValue),
          pValueRaw: correctedPValue,
          pValueStars: pStars(correctedPValue),
        }

        return <ComparingMetaGridEntry>{
          ...t,
          test: {
            reference,
            difference,
          },
        }
      })
  }
  /** deprecated, remove */
  private compareEntries(cube: Cube, baseEntries: MetaGridEntry[], comparingEntries: MetaGridEntry[]): MetaGridEntry[] {
    return comparingEntries
      .map(comparingEntry => {
        // use startsWith instead of eq to allow comparisons across hierarchy levels
        // TODO verify that most granular dimension must be the last item in the ID or replace
        const baseEntry = baseEntries.find(b => comparingEntry.id.startsWith(b.id))
        if (baseEntry == undefined) {
          return undefined
        }
        const measurementsRaw: Record<string, number|string> = {}
        const measurements: Record<string, string> = {}

        for (const m in baseEntry.measurements) {
          measurementsRaw[m] = (comparingEntry.measurementsRaw[m] as number) - (baseEntry.measurementsRaw[m] as number)
          const index = cube.measurements.findIndex(mm => mm.id == m)
          measurements[m] = (measurementsRaw[m] > 0 ? '+' : '') + this.format(cube.measurements[index], measurementsRaw[m])
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
  public getDimensions(query: AbstractCubeQuery): Dimension[] {
    return query.dimensionsIds.map(id =>  this.getDimension(query, id))
  }
  private getDimension(query: AbstractCubeQuery, id: string): Dimension {
    if (!(query.cubeId in this.config)) {
      throw 'Invalid cubeId ' + query.cubeId
    }

    const cube = this.config[query.cubeId]
    const dimension = cube.dimensions.find(d => id == d.id)
    if (dimension == undefined) {
      throw new Error('Invalid dimension id ' + id)
    }
    return dimension
  }
  public getMeasurements(query: AbstractCubeQuery): Measurement[] {
    return query.measurementsIds.map(id => this.getMeasurement(query, id))
  }
  public getComparingMeasurement(query: CubeComparingQuery): Measurement {
    return this.getMeasurement(query, query.measurementsIds[0])
  }
  private getMeasurement(query: AbstractCubeQuery, id: string): Measurement {
    if (!(query.cubeId in this.config)) {
      throw 'Invalid cubeId ' + query.cubeId
    }

    const cube = this.config[query.cubeId]
    const measurement = cube.measurements.find(m => id == m.id)
    if (measurement == undefined) {
      throw new Error('Invalid measurement id ' + id)
    }
    return measurement
  }
  public queryToLocation(query: Partial<CubeQuery|CubeComparingQuery>): Location {
    if ('comparing' in query) {
      const q = query as CubeComparingQuery
      // slices are swapped for compatibility with old dashboard links
      const slices = query.slices ? generateQueryParams(query.slices, 'compareFilter') : {}
      const testSlices = query.slices ? generateQueryParams(q.reference.slices, 'filter') : {}
      return {
        query: {
          ...slices,
          ...testSlices,
          compare: 'true',
          cube: q.cubeId,
          dimension: q.dimensionsIds,
          metric: q.measurementsIds,
        },
      }
    } else {
      const slices = query.slices ? generateQueryParams(query.slices, 'filter') : {}
      const q = query as CubeQuery
      return {
        query: {
          ...slices,
          compare: undefined,
          cube: q.cubeId,
          dimension: q.dimensionsIds,
          metric: q.measurementsIds,
          sort: q.sortId,
        },
      }
    }
  }
  locationToQuery(location: Route, config: Config, defaultCubeId: string): CubeQuery|CubeComparingQuery {
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

    if (comparing) {
      return {
        comparing: true,
        cubeId,
        slices: comparingSlices!,
        dimensionsIds,
        measurementsIds,
        reference: {
          cubeId,
          dimensionsIds,
          slices: slices,
          measurementsIds,
        },
      }
    } else {
      return {
        cubeId,
        slices,
        dimensionsIds,
        measurementsIds,
        sortId,
      }
    }
  }
  hash(query: CubeQuery|CubeComparingQuery): string {
    const hashCode = (s: string) => {
      if (s.length === 0) {
        return 0
      }

      let hash = 0;
      for (let i = 0; i < s.length; i++) {
        const chr = s.charCodeAt(i)
        hash = ((hash << 5) - hash) + chr
        hash |= 0
      }
      return hash
    }

    return hashCode(JSON.stringify(query)).toString()
  }
}
