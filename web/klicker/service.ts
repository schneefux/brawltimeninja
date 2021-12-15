import { Config, Cube, Dimension, Measurement, MetaGridEntry, SliceValue, CubeQuery, ValueType, CubeResponse, CubeComparingQuery, CubeComparingResponse, MetaGridEntryDiff, ComparingMetaGridEntry } from "~/klicker"
import cubejs, { CubejsApi, Filter, ResultSet, TQueryOrderObject } from "@cubejs-client/core"
import * as d3format from "d3-format"
import { format as formatDate, parseISO } from "date-fns"
import { capitalizeWords } from "~/lib/util"

// TODO refactor clicker -> move all functions into here

export default class Klicker {
  private cubejsApi: CubejsApi

  constructor(cubeUrl: string, public config: Config) {
    this.cubejsApi = cubejs('', { apiUrl: cubeUrl + '/cubejs-api/v1' })
  }

  // override
  public $t(key: string) {
    return key
  }

  // override
  public $te(key: string) {
    return false
  }

  // override & extend
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

  public getName(m: Measurement|Dimension, modifier?: string): string {
    const i18nKey = 'metric.' + m.id + (modifier != undefined ? '.' + modifier : '')

    if (this.$te(i18nKey)) {
      return this.$t(i18nKey) as string
    }

    // fall back to name
    return m.name || m.id
  }

  public async query(query: CubeQuery|CubeComparingQuery): Promise<CubeResponse> {
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

    const data = this.mapToMetaGridEntry(cube, dimensions, measurements, rawData)

    return {
      kind: 'response',
      query,
      data,
    }
  }

  public async comparingQuery(query: CubeComparingQuery): Promise<CubeComparingResponse> {
    // validate cube
    if (!(query.cubeId in this.config)) {
      throw 'Invalid cubeId ' + query.cubeId
    }
    // TODO should comparisons across different cubeIds be allowed? if not -> push cubeId up
    if (!(query.reference.cubeId in this.config)) {
      throw 'Invalid reference cubeId ' + query.reference.cubeId
    }

    // validate dimensions
    if (!query.reference.dimensionsIds.every(d => query.dimensionsIds.includes(d))) {
      throw new Error('Reference dataset must match or aggregate test dataset')
    }

    const cube = this.config[query.cubeId]

    // validate measurement
    const comparingMeasurement = cube.measurements.find(m => m.id == query.measurementsIds[0])
    if (comparingMeasurement == undefined) {
      throw new Error(`Invalid comparison, missing ${query.measurementsIds[0]} in test cube`)
    }
    const testCube = this.config[query.reference.cubeId]
    if (!testCube.measurements.some(m => m.id == query.measurementsIds[0])) {
      throw new Error(`Invalid comparison, missing ${query.measurementsIds[0]} in reference cube`)
    }
    if (comparingMeasurement.type != 'quantitative') {
      throw new Error(`Only quantitative measures can be compared, ${comparingMeasurement.id} is ${comparingMeasurement.type}`)
    }

    // validate sortId
    const sortMeasurement = cube.measurements
      .find(m => query.sortId == m.id)
    const sortDimension = cube.dimensions
      .find(d => query.sortId == d.id)
    const sortSpecial = ['difference', 'pvalue'].includes(query.sortId)
    if (sortMeasurement == undefined && sortDimension == undefined && !sortSpecial) {
      throw new Error('Invalid sort id ' + query.sortId)
    }
    if (query.sortId == 'pvalue' && comparingMeasurement.statistics == undefined) {
      throw new Error('Cannot sort ' + comparingMeasurement.id + ' by p value, no test defined')
    }

    // execute both queries
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

    let data = this.compare(referenceResponse.data, testResponse.data, comparingMeasurement, query.reference.dimensionsIds)

    // perform client-side sort & limit
    if (query.sortId == 'difference') {
      data.sort((d1, d2) => d2.test.difference.differenceRaw - d1.test.difference.differenceRaw)
    }
    if (query.sortId == 'pvalue') {
      data.sort((d1, d2) => d1.test.difference.pValueRaw - d2.test.difference.pValueRaw)
    }

    if (query.significant) {
      data = data.filter(d => d.test.difference.pValueRaw <= 0.05)
    }

    if (query.limit) {
      data = data.slice(0, query.limit)
    }

    return {
      ...testResponse,
      kind: 'comparingResponse',
      query,
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

  private compare(referenceData: MetaGridEntry[], testData: MetaGridEntry[], comparing: Measurement, referenceDimensionIds: string[]): ComparingMetaGridEntry[] {
    // test data might be in a lower hierarchy level than reference data - calculate an ID to join them
    const calculateId = (m: MetaGridEntry) => referenceDimensionIds.map(id => `${id}=${m.dimensions[id]};`).join('')
    const referenceDataMap: Record<string, MetaGridEntry> = {}
    referenceData.forEach(r => referenceDataMap[calculateId(r)] = r)

    return testData
      // ignore non-comparables
      .filter(t => calculateId(t) in referenceDataMap)
      .map(t => {
        const reference = referenceDataMap[calculateId(t)]

        const diff = (t.measurementsRaw[comparing.id] as number) - (reference.measurementsRaw[comparing.id] as number)
        const pValue = comparing.statistics?.test(referenceDataMap[calculateId(t)], t) || 1
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

  public hash(query: CubeQuery|CubeComparingQuery): string {
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
