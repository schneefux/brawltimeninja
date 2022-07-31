/**
 * Map encoded feature ID values to probabilities
 */
export interface ProbabilityTable {
  featureIds: string[]
  probabilities: Map<string, ProbabilityValue>
}

export interface ProbabilityValue {
  values: string[]
  probability: number
}

export interface Classifier {
  /**
   * Estimate the class probability for the given value
   */
  predict(classAttributeValue: string, values: string[]): number
}
