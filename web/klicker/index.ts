export interface Config extends Record<string, Cube> {}

// helper function which infers keys and restricts values to ElementType
export const asDimensions = <T>(et: { [K in keyof T]: Dimension }) => et
export const asMeasurements = <T>(et: { [K in keyof T]: Measurement }) => et
export const asSlice = <T>(et: { [K in keyof T]: Slice }) => et

export type ValueType = 'quantitative'|'temporal'|'ordinal'|'nominal'
export type MeasureType = 'number'|'count'|'countDistinct'|'countDistinctApprox'|'sum'|'avg'|'min'|'max'|'runningTotal'
export type DimensionType = 'time'|'string'|'number'|'boolean'|'geo'
export type OperatorType = 'equals'|'notEquals'|'contains'|'notContains'|'gt'|'gte'|'lt'|'lte'|'set'|'notSet'|'inDateRange'|'notInDateRange'|'beforeDate'|'afterDate'
export type FormatType = 'duration'|'y/n'|'formatMode'|string // or date format or d3-format spec

export interface State {
  cubeId: string
  slices: SliceValue
  comparingSlices?: SliceValue
  dimensionsIds: string[]
  measurementsIds: string[]
  sortId: string
  limit?: number
}

export interface Cube {
  id: string
  table: string
  name: string
  hidden: boolean
  dimensions: Dimension[]
  defaultDimensionsIds: string[]
  measurements: Measurement[]
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
export interface Measurement {
  id: string
  // TODO move all `name`s to en.json
  name?: string
  description: string
  formatter: string
  d3formatter: string
  sign: number
  percentageOver?: string // dimension id
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
    type: MeasureType
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
  formatter: FormatType
  /**
   * Measures to always request when requesting dimension.
   * Used for attributes of SCDs.
   */
  additionalMeasures: string[]
  hidden: boolean
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

export interface SliceValue extends Record<string, string[]> { }

export interface MetaGridEntry {
  id: string
  dimensionsRaw: Record<string, Record<string, string>>
  measurementsRaw: Record<string, number|string>
  dimensions: Record<string, string>
  measurements: Record<string, string>
  meta: Record<string, string|number>
}

export interface MetaGridEntryTiered extends MetaGridEntry {
  tier: string
}
