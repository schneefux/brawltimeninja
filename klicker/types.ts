import { Filter } from "@cubejs-client/core"
import { PluginConfig } from "./composables/klicker"
import { Component } from "vue"

export interface Config extends Record<string, Cube> {}

// helper function which infers keys and restricts values to ElementType
/** @deprecated */
export const asSlice = <T>(et: { [K in keyof T]: Slice }) => et

export type ValueTypeNumber = 'quantitative'|'ordinal'
export type ValueTypeString = 'temporal'|'nominal'
export type ValueType = ValueTypeNumber | ValueTypeString
export type MetricType = 'number'|'count'|'countDistinct'|'countDistinctApprox'|'sum'|'avg'|'min'|'max'|'runningTotal'
export type DimensionType = 'time'|'string'|'number'|'boolean'|'geo'
export type OperatorType = 'equals'|'notEquals'|'contains'|'notContains'|'gt'|'gte'|'lt'|'lte'|'set'|'notSet'|'inDateRange'|'notInDateRange'|'beforeDate'|'afterDate'
export type FormatType = 'duration'|'y/n'|'formatMode'|string // or date format or d3-format spec

export interface Cube {
  name: string
  /**
   * cube.js ID
   */
  id: string
  table: string
  dimensions: Dimension[]
  metrics: Metric<any>[]
  slices: Slice[]
  materializations?: Cube[]
  /**
   * ids
   * @deprecated
   */
  metaMetrics: string[]
  /**
   * @deprecated
   */
  defaultDimensionsIds: string[]
  /**
   * @deprecated
   */
  defaultMetricIds: string[]
  /**
   * @deprecated
   */
  defaultSliceValues: SliceValue
}

/**
 * Metric which will be transformed into a cube.js measure
 * with id `${id}_measure`.
 */
export interface Metric<T=string|number> {
  /**
   * Globally unique metric identifier.
   * Across all cubes, every metric with this ID must have the same meaning to the user.
   * Used as cube.js ID.
   */
  id: string
  type: T extends string ? ValueTypeString : ValueTypeNumber
  // TODO move all `name`s to en.json
  name?: string
  description?: string
  formatter?: string
  d3formatter?: string
  sign: number
  transform?: (entries: SerializableMetaGridEntry[]) => T[]
  /**
   * Vega.js encoding configuration
   * @see https://vega.github.io/vega-lite/docs/encoding.html
   */
  vega?: any
  /**
   * cube.js configuration.
   */
  config: {
    sql: string
    type: MetricType
  }
  /**
   * Configuration for statistical tests and confidence intervals
   */
  statistics?: {
    test?: {
      name: string
      test(referenceMetrics: MetaGridEntry['metricsRaw'], testMetrics: MetaGridEntry['metricsRaw']): number
      requiresMetrics: string[]
    }
    ci?: {
      ci(data: MetaGridEntry['metricsRaw']): ConfidenceInterval
      requiresMetrics: string[]
    }
  }
}

/**
 * Dimension which will be transformed into a cube.js dimension
 * with id `${id}_dimension`.
 */
export interface Dimension {
  /**
   * Globally unique dimension identifier.
   * Across all cubes, every dimension with this ID must have the same meaning to the user.
   * Used as cube.js ID.
   */
  id: string
  // TODO move all `name`s to en.json
  name?: string
  /**
   * IDs of the dimensions that this dimension aggregates.
   */
  childIds?: string[]
  /**
   * Column which contains a human-readable identifier.
   * May be the dimension ID or one of additionalMetrics.
   */
  naturalIdAttribute: string
  /**
   * Specification to use for formatting the natural ID.
   */
  formatter?: FormatType
  /**
   * Metrics to always request when requesting dimension.
   * Used for attributes of SCDs.
   */
  additionalMetrics: string[]
  hidden?: boolean
  type: ValueType
  /**
   * Vega.js scale configuration
   * @see https://vega.github.io/vega-lite/docs/scale.html
   */
  scale?: any
  /**
   * cube.js configuration.
   */
  config: {
    sql: string
    type: DimensionType
  }
}

export interface Slice {
  id: string
  config: { // cube.js config
    // TODO it almost never makes sense to refer to a measure
    // because that only filters the results
    member: string // dimension/measure id
    operator: OperatorType
  }
  // TODO: for description
  // formatter: string
}

export interface SliceValue extends Record<string, (string|undefined)[]> { }

export type SliceValueUpdateListener = (s: Partial<SliceValue>) => void

export interface VisualisationProp {
  name: string
  /**
   * Component to bind to
   */
  component: string
  /**
   * Component import (optional, for non-global components)
   */
  import?: Component
  /**
   * HTML attributes or props to apply to the validator
   */
  props: Record<string, any>
}

export interface WidgetSpec {
  name: string
  component: string
  import: Component
}

export interface StaticWidgetSpec extends WidgetSpec {
  /**
   * Grid cells are 150px * 150px per unit.
   */
  initialDimensions: {
    rows: number
    columns: number
  }
  resizable?: boolean
  scalable?: boolean
  props?: Record<string, VisualisationProp>
}

/**
 * Render a query result
 */
export interface VisualisationSpec extends StaticWidgetSpec {
  applicable(dimensions: Dimension[], metrics: Metric[], size: number, comparing: boolean, data: MetaGridEntry[]|MetaGridEntryDiff[]): boolean
  recommended?(dimensions: Dimension[], metrics: Metric[], size: number, comparing: boolean, data: MetaGridEntry[]|MetaGridEntryDiff[]): boolean
}

/**
 * Modify a query's filter conditions
 */
export interface SlicerSpec extends WidgetSpec {
  applicable(dimensions: Dimension[], cubeId: string): boolean
}

/**
 * Render the value of a metric
 *
 * By default, many visualisations render values as numbers or text.
 * With a renderer, they can be replaced by a rich representation such as an image.
 */
export interface MetricRendererSpec extends WidgetSpec {
  /**
   * id of the rendered metric
   *
   * There should not be two applicable renderers that replace the same metric.
   * Only one will be rendered.
   */
  replacesMetricId: string
  applicable(metrics: Metric[]): boolean
}

/**
 * Render the value of one or multiple dimensions
 *
 * By default, many visualisations render values as numbers or text.
 * With a renderer, they can be replaced by a rich representation such as an image.
 */
export interface DimensionRendererSpec extends WidgetSpec {
  /**
   * ids of the dimensions that should be hidden in favor of the renderer
   */
  replacesDimensionIds: string[]
  applicable(dimensions: Dimension[]): boolean
}

export interface ConfidenceInterval {
  lower: number
  mean: number
  upper: number
}

/** serializable types: no formatting */
export interface SerializableMetaGridEntry {
  id: string
  dimensionsRaw: Record<string, Record<string, string>>
  metricsRaw: Record<string, number|string>
  metricsCI?: Record<string, ConfidenceInterval>
}

/** adds formatting */
export interface MetaGridEntry extends SerializableMetaGridEntry {
  dimensions: Record<string, string>
  metrics: Record<string, string>
  metricsCI: Record<string, ConfidenceInterval>
}

export interface SerializableComparingMetaGridEntry extends SerializableMetaGridEntry {
  test: {
    reference: SerializableMetaGridEntry
    difference: SerializableMetaGridEntryDiff
  }
}

export interface ComparingMetaGridEntry extends MetaGridEntry {
  test: {
    reference: MetaGridEntry
    difference: MetaGridEntryDiff
  }
}

export interface MetaGridEntryTiered extends MetaGridEntry {
  tier: string
}

export interface SerializableMetaGridEntryDiff {
  differenceRaw: number
  pValueRaw: number
}

export interface MetaGridEntryDiff extends SerializableMetaGridEntryDiff {
  difference: string
  annotatedDifference: string
  pValueStars: string
}

export interface AbstractCubeResponse<Q extends CubeQuery, M extends MetaGridEntry> {
  kind: string
  query: Q
  data: M[]
}

export interface AbstractSerializableCubeResponse<Q extends CubeQuery, S extends SerializableMetaGridEntry> {
  kind: string
  query: Q
  data: S[]
}

export interface CubeResponse extends AbstractCubeResponse<CubeQuery, MetaGridEntry> {
  kind: 'response'
}

export interface SerializableCubeResponse extends AbstractSerializableCubeResponse<CubeQuery, SerializableMetaGridEntry> {
  kind: 'response'
}

export interface CubeComparingResponse extends AbstractCubeResponse<CubeComparingQuery, ComparingMetaGridEntry> {
  kind: 'comparingResponse'
}

export interface SerializableCubeComparingResponse extends AbstractSerializableCubeResponse<CubeComparingQuery, SerializableComparingMetaGridEntry> {
  kind: 'comparingResponse'
}

/**
 * Serializable CubeQueryConfiguration
 */
export interface CubeQuery {
  cubeId: string
  slices: SliceValue
  dimensionsIds: string[]
  metricsIds: string[]
  limit?: number
  sortId: string
  comparing?: boolean
  confidenceInterval?: boolean
  name?: string
}

export type CubeQueryFilter = (e: SerializableMetaGridEntry) => boolean

export interface CubeComparingQuery extends CubeQuery {
  comparing: true
  reference: CubeQuery
}

export type CubeComparingQueryFilter = (e: SerializableComparingMetaGridEntry) => boolean

export interface CubeQueryConfiguration {
  cube: Cube
  sortMetric?: Metric<any>
  sortDimension?: Dimension
  dimensions: Dimension[]
  metrics: Metric[]
  slices: Filter[]
}

export interface Report {
  id: number|undefined
  created_at?: string
  updated_at?: string
  title: string
  width: number
  height: number
  widgets: ReportWidget[]
}

export interface Widget {
  id: string
  query: CubeQuery|CubeComparingQuery|undefined
  component: string
  props: Record<string, any>
}

export interface ReportWidget extends Widget {
  frame: {
    translate: number[]
    scale: number[]
    rotate: number
    width: number
    height: number
  }
}

export interface Grid {
  id: number|undefined
  created_at?: string
  updated_at?: string
  title: string
  columns: number|undefined
  widgets: GridWidget[]
}

export interface GridWidget extends Widget {
  frame: {
    rows: number
    columns: number
  }
}

export interface User {
  id: number
  reports: Report[]
  grids: Grid[]
}

export interface RouteQuery {
  query: Record<string, string[]>
}

export interface IKlickerService {
  config: Config
  visualisations: VisualisationSpec[]
  staticWidgets: StaticWidgetSpec[]
  slicers: SlicerSpec[]
  dimensionRenderers: DimensionRendererSpec[]
  metricRenderers: MetricRendererSpec[]

  format(spec: { type: ValueType, formatter?: string }, value: number|string|string[]): string

  getName(translate: PluginConfig['translate'], m: Metric|Dimension, modifier?: string): string

  /**
   * @param query Query specification
   * @param filter Filter to apply after client-side joins and transformations
   */
  query(query: CubeQuery, filter?: CubeQueryFilter): Promise<CubeResponse>
  queryAsSerialized(query: CubeQuery, filter?: CubeQueryFilter): Promise<SerializableCubeResponse>
  deserialize(serializedData: SerializableCubeResponse): CubeResponse

  /**
   * @param query Query specification
   * @param filter Filter to apply after client-side joins and transformations
   */
  comparingQuery(query: CubeComparingQuery): Promise<CubeComparingResponse>
  comparingQueryAsSerialized(query: CubeComparingQuery, filter: CubeComparingQueryFilter): Promise<SerializableCubeComparingResponse>
  comparingDeserialize(serializedData: SerializableCubeComparingResponse): CubeComparingResponse

  convertQueryToLocation(query: CubeQuery|CubeComparingQuery): RouteQuery
  convertLocationToQuery(config: Config, defaultCubeId: string, route: RouteQuery): CubeQuery|CubeComparingQuery

  convertSlicesToLocation(slices: SliceValue, defaults: SliceValue): RouteQuery
  convertLocationToSlices(route: RouteQuery, defaults: SliceValue): SliceValue

  /**
   * Return the full query configuration for the cube
   * with the smallest cardinality that can respond to the query.
   */
  findCubeQueryConfiguration(query: CubeQuery): CubeQueryConfiguration
}
