import { Config, VisualisationSpec, Cube, Dimension, Metric, MetaGridEntry, SliceValue, CubeQuery, ValueType, CubeResponse, CubeComparingQuery, CubeComparingResponse, MetaGridEntryDiff, ComparingMetaGridEntry, CubeQueryFilter, CubeComparingQueryFilter, SlicerSpec, StaticWidgetSpec, KlickerService, CubeQueryConfiguration, MetricRendererSpec, DimensionRendererSpec } from "./types"
import cubejs, { CubejsApi, Filter, Query, ResultSet, TQueryOrderObject } from "@cubejs-client/core"
import * as d3format from "d3-format"
import { format as formatDate, parseISO } from "date-fns"
import defaultVisualisations from "./visualisations"
import defaultStaticWidgets from "./static-widgets"
import { Route, Location } from "vue-router"

export const capitalizeWords = (str: string) => str.replace(/(?:^|\s|["'([{])+\S/g, match => match.toUpperCase())

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

function parseQueryParams(query: Record<string, string | (string | null)[] | null | undefined>, prefix: string): object {
  return Object.fromEntries(
    Object.entries(query)
      .filter(([key, value]) => key.startsWith(prefix + '[') && key.endsWith(']'))
      .map(([key, value]) => [key.substring((prefix + '[').length, key.length - ']'.length), safeDecode(Array.isArray(value) ? value : [value])])
  )
}

function generateQueryParams(o: Record<string, (string|number|undefined)[]>, prefix: string): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(o)
      .filter(([key, value]) => value != undefined)
      .map(([key, value]) => [prefix + '[' + key + ']', safeEncode(value)])
  )
}

class CubeDoesNotMatchQueryError extends Error {}

export default class Klicker implements KlickerService {
  private cubejsApi: CubejsApi
  public visualisations: VisualisationSpec[] = defaultVisualisations
  public staticWidgets: StaticWidgetSpec[] = defaultStaticWidgets
  public slicers: SlicerSpec[] = []
  public dimensionRenderers: DimensionRendererSpec[] = []
  public metricRenderers: MetricRendererSpec[] = []

  private runningQueries = new Map<string, Promise<ResultSet>>()

  constructor(cubeUrl: string,
      public config: Config,
      visualisations: VisualisationSpec[],
      staticWidgets: StaticWidgetSpec[],
      slicers: SlicerSpec[],
      dimensionRenderers: DimensionRendererSpec[],
      metricRenderers: MetricRendererSpec[],
  ) {
    this.cubejsApi = cubejs('', { apiUrl: cubeUrl + '/cubejs-api/v1' })
    this.visualisations = defaultVisualisations.concat(visualisations)
    this.staticWidgets = defaultStaticWidgets.concat(staticWidgets)
    this.slicers = slicers
    this.dimensionRenderers = dimensionRenderers
    this.metricRenderers = metricRenderers
  }

  // override
  public $t(key: string, args?: any) {
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
    if (['quantitative', 'ordinal'].includes(spec.type) && typeof value == 'number') {
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

  public getName(m: Metric|Dimension, modifier?: string): string {
    const i18nKey = 'metric.' + m.id + (modifier != undefined ? '.' + modifier : '')

    if (this.$te(i18nKey)) {
      return this.$t(i18nKey) as string
    }

    // fall back to name
    return m.name || m.id
  }

  // TODO on startup, validate that materializations are a subset of their parent
  private validateCube(query: CubeQuery, cube: Cube): CubeQueryConfiguration {
    // sort-id may either refer to a metric or a dimension
    const sortSpecial = ['difference', 'pvalue'].includes(query.sortId)
    const sortId = sortSpecial ? query.metricsIds[0] : query.sortId
    const sortMetric = cube.metrics
      .find(m => sortId == m.id)
    const sortDimension = cube.dimensions
      .find(d => sortId == d.id)
    if (sortMetric == undefined && sortDimension == undefined) {
      throw new CubeDoesNotMatchQueryError('Invalid sort id ' + query.sortId)
    }
    const dimensions = query.dimensionsIds.map(id => {
      const dimension = cube.dimensions.find(d => id == d.id)
      if (dimension == undefined) {
        throw new CubeDoesNotMatchQueryError('Invalid dimension id ' + id)
      }
      return dimension
    })

    const metrics = query.metricsIds.map(id => {
      const metric = cube.metrics.find(d => id == d.id)
      if (metric == undefined) {
        throw new CubeDoesNotMatchQueryError('Invalid metrics id ' + id)
      }
      return metric
    })

    const slices = Object.entries({
      ...cube.defaultSliceValues,
      ...query.slices,
    }).filter(([id, values]) => {
      if (!Array.isArray(values)) {
        throw new Error('Slice ' + id + ' must be an array')
      }
      return values.filter(v => v != undefined).length > 0
    }).map(([id, values]) => {
      const slice = cube.slices.find(s => s.id == id)
      if (slice == undefined) {
        throw new CubeDoesNotMatchQueryError('Could not find slice ' + id + ' in cube ' + cube.id)
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

    return {
      cube,
      sortMetric,
      sortDimension,
      dimensions,
      metrics,
      slices,
    }
  }

  public findCubeQueryConfiguration(query: CubeQuery) {
    const desiredConfig = this.validateCube(query, this.config[query.cubeId])

    if (process.env.NODE_ENV == 'development') {
      let bestConfig: CubeQueryConfiguration|undefined
      let minCubeCardinality = Infinity
      let matchedCubeIsAtRootLevel = true

      let materializations = Object.values(this.config)
      const errors: string[] = []

      for (const materialization of materializations ?? []) {
        try {
          const config = this.validateCube(query, materialization)
          const cubeCardinality = config.cube.dimensions.length
          if (cubeCardinality < minCubeCardinality) {
            bestConfig = config
            minCubeCardinality = cubeCardinality
            bestConfig.cube.materializations?.forEach(m => materializations.push(m))
            matchedCubeIsAtRootLevel = false
          }
        } catch (err) {
          if (!(err instanceof CubeDoesNotMatchQueryError)) {
            throw err
          } else {
            errors.push('cube ' + materialization.id + ' did not match: ' + err.message)
          }
        }
      }

      if (bestConfig == undefined) {
        throw new Error('No cube could match this query ' + JSON.stringify({ errors, query }, null, 2))
      }

      if (desiredConfig.cube.id != bestConfig.cube.id) {
        if (bestConfig.dimensions.length == bestConfig.cube.dimensions.length) {
          console.log('consider a different cubeId, found perfect materialization', bestConfig.cube.id, { query })
        } else {
          if (matchedCubeIsAtRootLevel) {
            console.log('found a different cube but no materialization, is this the right cubeId?', bestConfig.cube.id, { query })
          } else {
            console.log('consider a different cubeId, found materialization', bestConfig.cube.id, { query })
          }
        }
      }
    }

    return desiredConfig
  }

  /**
   * @param query Query specification
   * @param filter Filter to apply after client-side joins and transformations
   */
  public async query(query: CubeQuery, filter?: CubeQueryFilter): Promise<CubeResponse> {
    const config = this.findCubeQueryConfiguration(query)

    const metricsIds = (<string[]>[]).concat(
      config.metrics.map(m => m.id),
      query.confidenceInterval ? config.metrics.flatMap(m => m.statistics?.ci?.requiresMetrics ?? []) : [],
      config.dimensions.flatMap(d => d.additionalMetrics),
    )
    const queryMetrics = metricsIds.map(id => `${config.cube.id}.${id}_measure`)
    const queryDimensions = config.dimensions.map(d => config.cube.id + '.' + d.id + '_dimension')

    const queryOrder = config.sortMetric ? <TQueryOrderObject>{
      [config.cube.id + '.' + config.sortMetric.id + '_measure']: config.sortMetric.sign == +1 ? 'asc' : 'desc',
    } : <TQueryOrderObject>{
      [config.cube.id + '.' + config.sortDimension!.id + '_dimension']: 'desc',
    }

    const querySlices = config.slices

    const rawData = await this.load({
      measures: queryMetrics,
      dimensions: queryDimensions,
      filters: querySlices,
      order: queryOrder,
      limit: query.limit,
    })

    let data = this.mapToMetaGridEntry(config.cube, config.dimensions, config.metrics, rawData)

    if (filter != undefined) {
      data = data.filter(filter)
    }

    return {
      kind: 'response',
      query,
      data,
    }
  }

  /**
   * Send a query to cube.js
   *
   * If there are multiple concurrent identical queries,
   * return the same response for all of them.
   */
  private async load(query: Query) {
    const queryKey = JSON.stringify(query)
    let request = this.runningQueries.get(queryKey)
    if (request == undefined) {
      request = this.cubejsApi.load(query)
      this.runningQueries.set(queryKey, request)
    }

    try {
      return await request
    } finally {
      this.runningQueries.delete(queryKey)
    }
  }

  /**
   * @param query Query specification
   * @param filter Filter to apply after client-side joins and transformations
   */
  public async comparingQuery(query: CubeComparingQuery, filter?: CubeComparingQueryFilter): Promise<CubeComparingResponse> {
    // validate dimensions
    if (!query.reference.dimensionsIds.every(d => query.dimensionsIds.includes(d))) {
      throw new Error('Reference dataset must match or aggregate test dataset')
    }

    // validate metric
    if (query.metricsIds.length != 1) {
      throw new Error('Can only compare queries with a single metric, test query has too many metrics')
    }
    if (query.reference.metricsIds.length != 1) {
      throw new Error('Can only compare queries with a single metric, reference query has too many metrics')
    }

    const cube = this.findCubeQueryConfiguration(query)
    const referenceCube = this.findCubeQueryConfiguration(query.reference)

    const comparingMetricId = query.metricsIds[0]
    const comparingMetric = cube.metrics.find(m => m.id == comparingMetricId)
    if (comparingMetric == undefined) {
      throw new Error(`Invalid comparison, missing ${comparingMetricId} in test cube`)
    }
    if (!referenceCube.metrics.some(m => m.id == comparingMetricId)) {
      throw new Error(`Invalid comparison, missing ${comparingMetricId} in reference cube`)
    }
    if (comparingMetric.type != 'quantitative') {
      throw new Error(`Only quantitative metrics can be compared, ${comparingMetric.id} is ${comparingMetric.type}`)
    }

    // validate sortId
    const sortSpecial = ['difference', 'pvalue'].includes(query.sortId)
    if (cube.sortMetric == undefined && cube.sortDimension == undefined && !sortSpecial) {
      throw new Error('Invalid sort id ' + query.sortId)
    }
    if (query.sortId == 'pvalue' && comparingMetric.statistics?.test == undefined) {
      throw new Error('Cannot sort ' + comparingMetric.id + ' by p value, no test defined')
    }

    // execute both queries
    const metricsIds = [comparingMetricId, ...(comparingMetric.statistics?.test?.requiresMetrics || [])]
    const partialQuery = {
      metricsIds,
      sortId: comparingMetricId,
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

    let data = this.compare(referenceResponse.data, testResponse.data, comparingMetric, query.reference.dimensionsIds)

    // perform client-side sort & limit
    if (query.sortId == 'difference') {
      data.sort((d1, d2) => d2.test.difference.differenceRaw - d1.test.difference.differenceRaw)
    }
    if (query.sortId == 'pvalue') {
      data.sort((d1, d2) => d1.test.difference.pValueRaw - d2.test.difference.pValueRaw)
    }

    if (filter) {
      data = data.filter(filter)
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

  private mapToMetaGridEntry(cube: Cube, dimensions: Dimension[], metrics: Metric[], resultSet: ResultSet): MetaGridEntry[] {
    // TODO consider refactoring to store it column-based (object of arrays) for performance
    const table = resultSet.rawData()

    // transform raw data to entries
    const entries = table.map(row => {
      // parse strings as float (cube.js clickhouse driver bug)
      const getValue = (type: Dimension['type']|Metric['type'], id: string) => {
        const key = cube.id + '.' + id
        return ['quantitative', 'ordinal'].includes(type) ? parseFloat(row[key] as string) : row[key]
      }

      const metricsRaw: MetaGridEntry['metricsRaw'] = {}
      for (const m of metrics) {
        metricsRaw[m.id] = getValue(m.type, m.id + '_measure')
      }

      const metricsCI: MetaGridEntry['metricsCI'] = {}
      for (const m of metrics) {
        const mRaw: MetaGridEntry['metricsRaw'] = {
          [m.id]: metricsRaw[m.id],
        }
        let missingRequiredKey = false
        if (m.statistics?.ci != undefined) {
          for (const id of m.statistics?.ci?.requiresMetrics) {
            const key = `${cube.id}.${id}_measure`
            if (!(key in row)) {
              missingRequiredKey = true
              break
            }
            mRaw[id] = parseFloat(row[key] as string)
          }
          if (!missingRequiredKey) {
            metricsCI[m.id] = m.statistics?.ci?.ci(mRaw)
          }
        }
      }

      const dimensionsRaw: MetaGridEntry['dimensionsRaw'] = {}
      let id = ''
      for (const d of dimensions) {
        const keys = d.additionalMetrics
          .map(m => m + '_measure')
          .concat(d.id + '_dimension')

        dimensionsRaw[d.id] = {}
        for (const k of keys) {
          const kShort = k.replace(/_measure|_dimension/g, '')
          dimensionsRaw[d.id][kShort] = getValue(d.type, k)
        }
        const naturalId = dimensionsRaw[d.id][d.naturalIdAttribute]
        if (naturalId == undefined) {
          throw new Error('Invalid natural id ' + d.naturalIdAttribute + ' for dimension ' + d.id)
        }
        id += `${d.id}=${naturalId};`
      }

      return <MetaGridEntry>{
        id,
        metricsRaw,
        metricsCI,
        dimensionsRaw,
        metrics: {},
        dimensions: {},
      }
    })

    // apply custom transformations
    for (const m of metrics) {
      if (m.transform != undefined) {
        const newValues = m.transform(entries)
        entries.forEach((row, i) => row.metricsRaw[m.id] = newValues[i])
      }
    }

    // apply formatters
    entries.forEach(entry => {
      for (const m of metrics) {
        entry.metrics[m.id] = this.format(m, entry.metricsRaw[m.id])
      }

      for (const d of dimensions) {
        const naturalId = entry.dimensionsRaw[d.id][d.naturalIdAttribute]
        const formatted = this.format(d, naturalId)
        entry.dimensions[d.id] = formatted
      }
    })

    return entries
  }

  private compare(referenceData: MetaGridEntry[], testData: MetaGridEntry[], comparing: Metric, referenceDimensionIds: string[]): ComparingMetaGridEntry[] {
    // test data might aggregate reference data - calculate an ID to join them
    const calculateId = (m: MetaGridEntry) => referenceDimensionIds.map(id => `${id}=${m.dimensions[id]};`).join('')
    const referenceDataMap: Record<string, MetaGridEntry> = {}
    referenceData.forEach(r => referenceDataMap[calculateId(r)] = r)

    return testData
      // ignore non-comparables
      .filter(t => calculateId(t) in referenceDataMap)
      .map(t => {
        const reference = referenceDataMap[calculateId(t)]

        const diff = (t.metricsRaw[comparing.id] as number) - (reference.metricsRaw[comparing.id] as number)
        const pValue = comparing.statistics?.test?.test(referenceDataMap[calculateId(t)].metricsRaw, t.metricsRaw) || 1
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
          annotatedDifference: diffFormatted + pStars(correctedPValue),
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

  convertQueryToLocation(query: CubeQuery|CubeComparingQuery) {
    if (query.comparing) {
      const q = query as CubeComparingQuery
      // slices are swapped for compatibility with old dashboard links
      const slices = q.slices ? generateQueryParams(q.slices, 'compareFilter') : {}
      const testSlices = q.slices ? generateQueryParams(q.reference.slices, 'filter') : {}
      return <Location>{
        query: {
          ...slices,
          ...testSlices,
          compare: 'true',
          cube: q.cubeId,
          compareDimension: q.dimensionsIds,
          dimension: q.reference.dimensionsIds,
          metric: q.metricsIds,
        },
      }
    } else {
      const q = query as CubeQuery
      const slices = q.slices ? generateQueryParams(q.slices, 'filter') : {}
      return <Location>{
        query: {
          ...slices,
          compare: undefined,
          cube: q.cubeId,
          dimension: q.dimensionsIds,
          metric: q.metricsIds,
          sort: q.sortId,
        },
      }
    }
  }

  convertLocationToQuery(config: Config, defaultCubeId: string, route: Route): CubeQuery|CubeComparingQuery {
    const query = route.query || {}

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

    let compareDimensionsIds: string[]
    if (comparing) {
      compareDimensionsIds = query.compareDimension as string[] || config[cubeId].defaultDimensionsIds
      if (typeof compareDimensionsIds == 'string') {
        compareDimensionsIds = [compareDimensionsIds]
      }
    }

    let metricsIds = query.metric as string[] || config[cubeId].defaultMetricIds
    if (typeof metricsIds == 'string') {
      metricsIds = [metricsIds]
    }

    const sortId = query.sort as string || metricsIds[0]
    const limit = typeof query.limit == 'string' ? parseInt(query.limit) : undefined

    if (comparing) {
      return {
        comparing: true,
        cubeId,
        sortId,
        limit,
        slices: comparingSlices!,
        dimensionsIds: compareDimensionsIds!,
        metricsIds,
        reference: {
          cubeId,
          sortId,
          slices,
          dimensionsIds,
          metricsIds,
        },
      }
    } else {
      return {
        cubeId,
        sortId,
        slices,
        limit,
        dimensionsIds,
        metricsIds,
      }
    }
  }

  convertSlicesToLocation(slices: SliceValue, defaults: SliceValue): Location {
    const slicesDiff = Object.fromEntries(
      Object.entries(slices)
        .filter(([key, value]) => JSON.stringify(defaults[key]) != JSON.stringify(value)))

    return {
      query: generateQueryParams(slicesDiff, 'filter'),
    }
  }

  convertLocationToSlices(route: Route, defaults: SliceValue): SliceValue {
    const slices = parseQueryParams(route.query, 'filter') as SliceValue

    return {
      ...defaults,
      ...slices,
    }
  }
}
