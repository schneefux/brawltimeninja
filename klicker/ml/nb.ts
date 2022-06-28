import { Classifier, ProbabilityTable } from './types'
import { encodeFeatureIds, encodeFeatureValues, jpdToCpt, jpdToMpd, range, removeAtIndices } from './util'

/**
 * Discrete Naive Bayes
 */
export default class NBClassifier implements Classifier {
  /**
   * Store x
   */
  private featureIds: string[]

  /**
   * Store Y
   */
  private classes: Set<string>

  /**
   * Store P(y)
   */
  private mpd: ProbabilityTable

  /**
   * Store P(x_j | y)
   */
  private cpts: Map<string, ProbabilityTable>

  constructor(
    jpd: ProbabilityTable,
    private classAttributeIndex: number,
  ) {
    this.featureIds = jpd.featureIds

    this.classes = new Set()
    for (const probabilityValue of jpd.probabilities.values()) {
      this.classes.add(probabilityValue.values[this.classAttributeIndex])
    }

    this.mpd = this.buildPy(jpd)
    this.cpts = this.buildPxy(jpd)
  }

  public predict(classAttributeValue: string, values: string[]): number {
    let numerator = 0
    let denominator = 0

    for (const c of this.classes) {
      values[this.classAttributeIndex] = c

      let product = this.getPy(values)
      if (product == undefined) {
        continue
      }

      for (let i = 0; i < this.featureIds.length; i++) {
        if (i == this.classAttributeIndex) {
          continue
        }

        const p = this.getPxy(i, values)
        if (p == undefined) {
          continue
        }

        product *= p
      }

      denominator += product
      if (classAttributeValue == c) {
        numerator = product
      }
    }

    return numerator / denominator
  }

  private buildPy(jpd: ProbabilityTable) {
    const otherIndices = removeAtIndices(range(jpd.featureIds.length), [this.classAttributeIndex])
    return jpdToMpd(jpd, otherIndices)
  }

  private getPy(values: string[]) {
    return this.mpd
      .probabilities
      .get(encodeFeatureValues([values[this.classAttributeIndex]]))
      ?.probability
  }

  private buildPxy(jpd: ProbabilityTable) {
    const cpts = new Map()

    for (let i = 0; i < jpd.featureIds.length; i++) {
      if (i == this.classAttributeIndex) {
        continue
      }

      const mpd = jpdToMpd(jpd, [i, this.classAttributeIndex])
      const id = encodeFeatureIds([this.featureIds[i]])
      cpts.set(id, jpdToCpt(mpd, this.classAttributeIndex))
    }

    return cpts
  }

  private getPxy(featureIndex: number, values: string[]) {
    return this.cpts
      .get(encodeFeatureIds([this.featureIds[featureIndex]]))!
      .probabilities
      .get(encodeFeatureValues([values[this.classAttributeIndex]]))
      ?.probability
  }
}
