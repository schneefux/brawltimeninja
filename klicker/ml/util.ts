import { ProbabilityTable } from './types'

export function encodeFeatureValues(values: string[]): string {
  return values.join(';')
}

export function encodeFeatureIds(featureIds: string[]) {
  return featureIds.join(';')
}

export function removeAtIndex<T>(array: T[], index: number) {
  const copy = array.slice()
  copy.splice(index, 1)
  return copy
}

export function removeAtIndices<T>(array: T[], indices: number[]) {
  indices.sort().reverse()
  const copy = array.slice()
  indices.forEach(i => copy.splice(i, 1))
  return copy
}

export function getAtIndices<T>(array: T[], indices: number[]) {
  return array.filter((v, i) => indices.includes(i))
}

export function range(to: number) {
  return [...Array(to).keys()]
}

/**
 * Convert a Joint Probability Distribution to a Marginal Probability Distribution
 */
export function jpdToMpd(jpd: ProbabilityTable, indicesToMarginalizeOut: number[]): ProbabilityTable {
  const mFeatureIds = removeAtIndices(jpd.featureIds, indicesToMarginalizeOut)
  const mpd: ProbabilityTable = {
    featureIds: mFeatureIds,
    probabilities: new Map(),
  }

  for (const entry of jpd.probabilities.values()) {
    const mFeatureValues = removeAtIndices(entry.values, indicesToMarginalizeOut)
    const id = encodeFeatureValues(mFeatureValues)

    if (!mpd.probabilities.has(id)) {
      mpd.probabilities.set(id, {
        values: mFeatureValues,
        probability: 0,
      })
    }
    mpd.probabilities.get(id)!.probability += entry.probability
  }

  return mpd
}

/**
 * Convert a Joint Probability Distribution to a Conditional Probability Table
 */
export function jpdToCpt(jpd: ProbabilityTable, featureOfInterestIndex: number): ProbabilityTable {
  const featureMpd = jpdToMpd(jpd, [featureOfInterestIndex])

  const cpt: ProbabilityTable = {
    featureIds: jpd.featureIds,
    probabilities: new Map(),
  }
  for (const [id, entry] of jpd.probabilities.entries()) {
    const mFeatureValues = removeAtIndex(entry.values, featureOfInterestIndex)
    const mpdId = encodeFeatureValues(mFeatureValues)

    cpt.probabilities.set(id, {
      values: entry.values,
      probability: entry.probability / featureMpd.probabilities.get(mpdId)!.probability,
    })
  }

  return cpt
}
