import { CubeResponse } from '@schneefux/klicker/types'
import { AODEClassifier } from '@schneefux/klicker/ml'
import { ProbabilityTable } from '@schneefux/klicker/ml/types'
import { encodeFeatureIds, encodeFeatureValues, getAtIndices, jpdToCpt, jpdToMpd } from '@schneefux/klicker/ml/util'

/**
 * Retrieve synergies and construct MPDs and CPTs
 *
 * @param data P(y | x_i, x_j) where all x_i share the same distribution
 */
export default function buildTeamWinratePredictor(data: CubeResponse) {
  const synergies = data.data

  // calculate P(x_i, x_j)
  const jpdWithoutClass: ProbabilityTable = {
    featureIds: ['brawler', 'ally'],
    probabilities: new Map(),
  }
  let total = 0
  for (const row of synergies) {
    total += row.metricsRaw.picks as number
  }
  for (const row of synergies) {
    const values = [row.dimensionsRaw.brawler.brawler, row.dimensionsRaw.ally.ally]
    const id = encodeFeatureValues(values)
    if (!jpdWithoutClass.probabilities.has(id)) {
      jpdWithoutClass.probabilities.set(id, {
        values,
        probability: 0,
      })
    }
    jpdWithoutClass.probabilities.get(id)!.probability += row.metricsRaw.picks as number / total
  }

  // calculate P(y, x_i, x_j) = P(y | x_i, x_j) * P(x_i, x_j)
  const jpd: ProbabilityTable = {
    featureIds: ['brawler', 'ally', 'result'],
    probabilities: new Map(),
  }
  for (const row of synergies) {
    const team = [row.dimensionsRaw.brawler.brawler, row.dimensionsRaw.ally.ally]
    const idTeam = encodeFeatureValues(team)

    const valuesVictory = [...team, 'victory']
    const probabilityVictory = row.metricsRaw.winRate as number
    const idVictory = encodeFeatureValues(valuesVictory)
    jpd.probabilities.set(idVictory, {
      values: valuesVictory,
      probability: probabilityVictory * jpdWithoutClass.probabilities.get(idTeam)!.probability,
    })

    const valuesDefeat = [...team, 'defeat']
    const probabilityDefeat = 1 - probabilityVictory
    const idDefeat = encodeFeatureValues(valuesDefeat)
    jpd.probabilities.set(idDefeat, {
      values: valuesDefeat,
      probability: probabilityDefeat * jpdWithoutClass.probabilities.get(idTeam)!.probability,
    })
  }

  // since they share the same distribution, give all brawlers identical IDs
  const featureIds = ['brawler', 'brawler', 'brawler', 'result']
  const classAttributeIndex = featureIds.indexOf('result')

  // calculate P(y, x_i) from P(y, x_i, x_j)
  // i => P(y, x_i)
  const mpds: Map<string, ProbabilityTable> = new Map()

  // all x_i have the same distribution; marginalize ally out
  const mpd = jpdToMpd(jpd, [1])
  mpds.set('brawler', {
    featureIds: getAtIndices(featureIds, [0, classAttributeIndex]),
    probabilities: mpd.probabilities,
  })

  // calculate P(x_j | y, x_i) from P(y, x_i, x_j)
  // i, j => P(x_j | y, x_i)
  const cpts: Map<string, ProbabilityTable> = new Map()

  // all x_i have the same distribution; condition on ally
  const cpt = jpdToCpt(jpd, 1)
  const id = encodeFeatureIds(['brawler', 'brawler'])
  cpts.set(id, {
    featureIds: getAtIndices(featureIds, [0, 1, classAttributeIndex]),
    probabilities: cpt.probabilities,
  })

  return new AODEClassifier({
    featureIds: ['brawler', 'brawler', 'brawler', 'result'],
    classes: ['victory', 'defeat'],
    cpts,
    mpds,
  }, 3)
}
