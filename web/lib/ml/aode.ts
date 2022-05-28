import { Classifier, ProbabilityTable } from './types'
import { encodeFeatureIds, encodeFeatureValues, getAtIndices, jpdToCpt, jpdToMpd, range, removeAtIndices } from './util'

/**
 * Discrete Averaged One-Dependence Estimator
 */
export default class AODEClassifier implements Classifier {
  /**
   * Store X
   */
  private featureIds: string[]

  /**
   * Store Y
   */
  private classes: Set<string>

  /**
   * Store i => P(y, x_i)
   */
  private mpds: Map<string, ProbabilityTable>

  /**
   * Store i, j => P(x_j | y, x_i)
   */
  private cpts: Map<string, ProbabilityTable>

  constructor(tables: {
    jpd: ProbabilityTable,
  } | {
    featureIds: string[],
    classes: string[],
    mpds: Map<string, ProbabilityTable>,
    cpts: Map<string, ProbabilityTable>,
  },
    private classAttributeIndex: number,
  ) {
    this.featureIds = 'jpd' in tables ? tables.jpd.featureIds : tables.featureIds

    this.classes = new Set()
    if ('jpd' in tables) {
      for (const probabilityValue of tables.jpd.probabilities.values()) {
        this.classes.add(probabilityValue.values[this.classAttributeIndex])
      }
    } else {
      tables.classes.forEach(c => this.classes.add(c))
    }


    if ('jpd' in tables) {
      this.mpds = this.buildPyx(tables.jpd)
      this.cpts = this.buildPxyx(tables.jpd)
    } else {
      this.mpds = tables.mpds
      this.cpts = tables.cpts
    }
  }

  public predict(classAttributeValue: string, values: string[]): number {
    let numerator = 0
    let denominator = 0

    for (const c of this.classes) {
      values[this.classAttributeIndex] = c

      for (let i = 0; i < this.featureIds.length; i++) {
        if (i == this.classAttributeIndex) {
          continue
        }

        let product = this.getPyx(i, values)
        if (product == undefined) {
          continue
        }

        for (let j = 0; j < this.featureIds.length; j++) {
          if (i == j || j == this.classAttributeIndex) {
            continue
          }

          const p = this.getPxyx(i, j, values)
          if (p == undefined) {
            continue
          }
          product *= p
        }

        denominator += product
        if (c == classAttributeValue) {
          numerator += product
        }
      }
    }

    return numerator / denominator
  }

  private buildPyx(jpd: ProbabilityTable) {
    const mpds = new Map()

    for (let i = 0; i < jpd.featureIds.length; i++) {
      if (i == this.classAttributeIndex) {
        continue
      }

      const otherIndices = removeAtIndices(range(jpd.featureIds.length), [i, this.classAttributeIndex])
      mpds.set(this.featureIds[i], jpdToMpd(jpd, otherIndices))
    }

    return mpds
  }

  private getPyx(featureIndex: number, values: string[]) {
    const orderedValues = getAtIndices(values, [this.classAttributeIndex, featureIndex])
    return this.mpds
      .get(this.featureIds[featureIndex])!
      .probabilities
      .get(encodeFeatureValues(orderedValues))
      ?.probability
  }

  private buildPxyx(jpd: ProbabilityTable) {
    const cpts = new Map()

    for (let i = 0; i < jpd.featureIds.length; i++) {
      for (let j = 0; j < jpd.featureIds.length; j++) {
        if (i == j || i == this.classAttributeIndex || j == this.classAttributeIndex) {
          continue
        }

        const otherIndices = removeAtIndices(range(jpd.featureIds.length), [i, j, this.classAttributeIndex])
        const mpd = jpdToMpd(jpd, otherIndices)
        const orderedIds = getAtIndices(this.featureIds, [i, j])
        const id = encodeFeatureIds(orderedIds)
        cpts.set(id, jpdToCpt(mpd, j))
      }
    }

    return cpts
  }

  private getPxyx(feature1Index: number, feature2Index: number, values: string[]) {
    const orderedIds = getAtIndices(this.featureIds, [feature1Index, feature2Index])
    const orderedValues = getAtIndices(values, [this.classAttributeIndex, feature1Index, feature2Index])
    return this.cpts
      .get(encodeFeatureIds(orderedIds))!
      .probabilities
      .get(encodeFeatureValues(orderedValues))
      ?.probability
  }
}
