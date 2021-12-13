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

export interface State {
  cubeId: string
  slices: SliceValue
  comparingSlices?: SliceValue
  dimensionsIds: string[]
  measurementsIds: string[]
  sortId: string
  limit?: number
}

export interface TestState {
  comparingMeasurementId: string
  reference: {
    cubeId: string
    slices: SliceValue
    dimensionsIds: string[]
  }
  test: {
    cubeId: string
    slices: SliceValue
    dimensionsIds: string[]
  }
}

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

export interface MetaGridEntry {
  id: string
  dimensionsRaw: Record<string, Record<string, string>>
  measurementsRaw: Record<string, number|string>
  dimensions: Record<string, string>
  measurements: Record<string, string>
}

export interface MetaGridEntryTiered extends MetaGridEntry {
  tier: string
}

export interface MetaGridEntryTest extends MetaGridEntry {
  test: {
    measurements: Record<string, number|string>
    differenceRaw: number
    difference: string
    annotatedDifference: string
    pValueRaw: number
  }
}

export interface TypedCubeResponse<S, D> {
  state: S
  dimensions: Dimension[]
  measurements: Measurement[]
  data: D[]
}

/** TODO deprecate in favor of TypedCubeResponse */
export interface CubeResponse extends TypedCubeResponse<State, MetaGridEntry> {
  /** TODO deprecate */
  comparing: boolean
}

export interface CubeResponseTest extends TypedCubeResponse<TestState, MetaGridEntryTest> {
  comparingMeasurement: Measurement
}
