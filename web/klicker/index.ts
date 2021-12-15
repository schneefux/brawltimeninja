export interface Config extends Record<string, Cube> {}

// helper function which infers keys and restricts values to ElementType
export const asDimensions = <T>(et: { [K in keyof T]: Dimension }) => et
export const asNumberMeasurements = <T>(et: { [K in keyof T]: Measurement<number> }) => et
export const asStringMeasurements = <T>(et: { [K in keyof T]: Measurement<string> }) => et
export const asSlice = <T>(et: { [K in keyof T]: Slice }) => et

export type ValueTypeNumber = 'quantitative'|'ordinal'
export type ValueTypeString = 'temporal'|'nominal'
export type ValueType = ValueTypeNumber | ValueTypeString
export type MeasureType = 'number'|'count'|'countDistinct'|'countDistinctApprox'|'sum'|'avg'|'min'|'max'|'runningTotal'
export type DimensionType = 'time'|'string'|'number'|'boolean'|'geo'
export type OperatorType = 'equals'|'notEquals'|'contains'|'notContains'|'gt'|'gte'|'lt'|'lte'|'set'|'notSet'|'inDateRange'|'notInDateRange'|'beforeDate'|'afterDate'
export type FormatType = 'duration'|'y/n'|'formatMode'|string // or date format or d3-format spec

export interface Cube {
  id: string
  table: string
  name: string
  hidden?: boolean
  dimensions: Dimension[]
  defaultDimensionsIds: string[]
  measurements: Measurement<any>[]
  defaultMeasurementIds: string[]
  slices: Slice[]
  defaultSliceValues: SliceValue
  /**
   * deprecate
   */
  // ids
  metaMeasurements: string[]
}

/**
 * Measure which will be transformed into a cube.js measure
 * with id `${id}_measure`.
 */
export interface Measurement<T=string|number> {
  id: string
  type: T extends string ? ValueTypeString : ValueTypeNumber
  // TODO move all `name`s to en.json
  name?: string
  description?: string
  formatter?: string
  d3formatter?: string
  sign: number
  /**
   * Vega.js scale configuration
   * @see https://vega.github.io/vega-lite/docs/scale.html
   */
  scale?: any
  transform?: (entries: MetaGridEntry[]) => T[]
  /**
   * cube.js configuration.
   */
  config: {
    sql: string
    type: MeasureType
  }
  /**
   * Configuration for statistical tests
   */
  statistics?: {
    test(referenceData: MetaGridEntry, testData: MetaGridEntry): number
    requiresMeasurements: string[]
  }
}

/**
 * Dimension which will be transformed into a cube.js dimension
 * with id `${id}_dimension`.
 */
export interface Dimension {
  id: string
  // TODO move all `name`s to en.json
  name?: string
  /**
   * Column which contains a human-readable identifier.
   * May be the dimension or one of additionalMeasures.
   */
  naturalIdAttribute: string
  /**
   * Specification to use for formatting the natural ID.
   */
  formatter?: FormatType
  /**
   * Measures to always request when requesting dimension.
   * Used for attributes of SCDs.
   */
  additionalMeasures: string[]
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
    member: string // dimension/measure id
    operator: OperatorType
  }
  // TODO: for description
  // formatter: string
}

export interface SliceValue extends Record<string, (string|undefined)[]> { }

export type SliceValueUpdateListener = (s: Partial<SliceValue>) => void

export interface MetaGridEntry {
  id: string
  dimensionsRaw: Record<string, Record<string, string>>
  measurementsRaw: Record<string, number|string>
  dimensions: Record<string, string>
  measurements: Record<string, string>
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

export interface MetaGridEntryDiff {
  differenceRaw: number
  difference: string
  annotatedDifference: string
  pValueRaw: number
  pValueStars: string
}

export interface AbstractCubeResponse<Q extends CubeQuery, M extends MetaGridEntry> {
  kind: string
  query: Q
  data: M[]
}

export interface CubeResponse extends AbstractCubeResponse<CubeQuery, MetaGridEntry> {
  kind: 'response'
}

export interface CubeComparingResponse extends AbstractCubeResponse<CubeComparingQuery, ComparingMetaGridEntry> {
  kind: 'comparingResponse'
}

export interface CubeQuery {
  cubeId: string
  slices: SliceValue
  dimensionsIds: string[]
  measurementsIds: string[]
  limit?: number
  sortId: string
}

export interface CubeComparingQuery extends CubeQuery {
  comparing: true
  reference: CubeQuery
}

// TODO type all components with CubeQuery|CubeComparingQuery
