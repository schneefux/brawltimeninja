import AODEClassifier from './aode'
import NBClassifier from './nb'
import { ProbabilityTable } from './types'
import { encodeFeatureIds, encodeFeatureValues, jpdToCpt, jpdToMpd, getAtIndices } from './util'

function cubeQuery(query: any) {
  return fetch(`https://cube.brawltime.ninja/cubejs-api/v1/load?query=${encodeURIComponent(JSON.stringify(query))}&queryType=multi`)
    .then(r => r.json())
    .then(j => {
      if ('results' in j) {
        return j.results[0].data
      }
      console.error(j)
    })
}

/**
 * Retreive team dataset and return a JPD
 */
async function getTeamDataset() {
  // given P(y | x_i, x_j, x_k)
  const brawlerDataset = await cubeQuery({
    'measures': ['battle.winRate_measure', 'battle.picks_measure'],
    'dimensions': ['battle.team_dimension'],
    'filters': [
      { 'member': 'battle.season_dimension', 'operator': 'afterDate', 'values': ['2022-03-01'] },
      { 'member': 'battle.teamSize_dimension', 'operator': 'gt', 'values': ['2'] },
      { 'member': 'battle.mode_dimension', 'operator': 'equals', 'values': ['gemGrab'] },
    ],
    'order': { 'battle.picks_measure': 'desc' },
  })

  // construct P(y, x_i, x_j, x_k) = P(y | x_i, x_j, x_k) * P(x_i, x_j, x_k)
  const jpdFull: ProbabilityTable = {
    featureIds: ['brawler1', 'brawler2', 'brawler3', 'result'],
    probabilities: new Map(),
  }

  const jpdWithoutClass: ProbabilityTable = {
    featureIds: ['brawler1', 'brawler2', 'brawler3'],
    probabilities: new Map(),
  }
  let total = 0
  for (const row of brawlerDataset) {
    total += parseInt(row['battle.picks_measure'])
  }
  for (const row of brawlerDataset) {
    const values = row['battle.team_dimension']
    const id = encodeFeatureValues(values)
    if (!jpdWithoutClass.probabilities.has(id)) {
      jpdWithoutClass.probabilities.set(id, {
        values,
        probability: 0,
      })
    }
    jpdWithoutClass.probabilities.get(id)!.probability += row['battle.picks_measure'] / total
  }

  for (const row of brawlerDataset) {
    const team = row['battle.team_dimension']
    const idTeam = encodeFeatureValues(team)
    const valuesVictory = [...team, 'victory']
    const probabilityVictory = parseFloat(row['battle.winRate_measure'])
    const idVictory = encodeFeatureValues(valuesVictory)
    jpdFull.probabilities.set(idVictory, {
      values: valuesVictory,
      probability: probabilityVictory * jpdWithoutClass.probabilities.get(idTeam)!.probability,
    })

    const valuesDefeat = [...team, 'defeat']
    const probabilityDefeat = (1 - parseFloat(row['battle.winRate_measure']))
    const idDefeat = encodeFeatureValues(valuesDefeat)
    jpdFull.probabilities.set(idDefeat, {
      values: valuesDefeat,
      probability: probabilityDefeat * jpdWithoutClass.probabilities.get(idTeam)!.probability,
    })
  }

  const probSum = [...jpdFull.probabilities.values()].reduce((sum, p) => sum + p.probability, 0)
  if (1.0 - probSum > 10e-8) {
    throw 'Sum of probabilities is not 1.0! ' + probSum
  }

  return {
    jpd: jpdFull,
    dataset: brawlerDataset,
  }
}

/**
 * Retrieve synergies and construct MPDs and CPTs
 */
async function getSynergies() {
  // given P(y | x_i, x_j) where all x_i share the same distribution
  const synergies = await cubeQuery({
    'measures': ['brawlerAllies.winRate_measure', 'brawlerAllies.picks_measure'],
    'dimensions': ['brawlerAllies.brawler_dimension', 'brawlerAllies.ally_dimension'],
    'filters': [
      { 'member': 'brawlerAllies.season_dimension', 'operator': 'afterDate', 'values': ['2022-03-01'] },
      { 'member': 'brawlerAllies.mode_dimension', 'operator': 'equals', 'values': ['gemGrab'] },
    ],
  })

  // calculate P(x_i, x_j)
  const jpdWithoutClass: ProbabilityTable = {
    featureIds: ['brawler', 'ally'],
    probabilities: new Map(),
  }
  let total = 0
  for (const row of synergies) {
    total += parseInt(row['brawlerAllies.picks_measure'])
  }
  for (const row of synergies) {
    const values = [row['brawlerAllies.brawler_dimension'], row['brawlerAllies.ally_dimension']]
    const id = encodeFeatureValues(values)
    if (!jpdWithoutClass.probabilities.has(id)) {
      jpdWithoutClass.probabilities.set(id, {
        values,
        probability: 0,
      })
    }
    jpdWithoutClass.probabilities.get(id)!.probability += parseInt(row['brawlerAllies.picks_measure']) / total
  }

  // calculate P(y, x_i, x_j) = P(y | x_i, x_j) * P(x_i, x_j)
  const jpd: ProbabilityTable = {
    featureIds: ['brawler', 'ally', 'result'],
    probabilities: new Map(),
  }
  for (const row of synergies) {
    const team = [row['brawlerAllies.brawler_dimension'], row['brawlerAllies.ally_dimension']]
    const idTeam = encodeFeatureValues(team)

    const valuesVictory = [...team, 'victory']
    const probabilityVictory = parseFloat(row['brawlerAllies.winRate_measure'])
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

  return {
    mpds,
    cpts,
  }
}

async function main() {
  const { jpd, dataset: brawlerDataset } = await getTeamDataset()
  const { cpts, mpds } = await getSynergies()

  // TODO create unit test
  console.time('AODE benchmark')
  const aode = new AODEClassifier({ jpd }, 3)
  let aodeMse = 0
  for (const row of brawlerDataset) {
    const expected = parseFloat(row['battle.winRate_measure'])
    const values = [...row['battle.team_dimension'], undefined]
    const actual = aode.predict('victory', values)
    aodeMse += Math.pow(expected - actual, 2) / brawlerDataset.length
  }
  console.timeEnd('AODE benchmark')
  console.log('AODE MSE', aodeMse)

  console.time('AODE Synergy benchmark')
  const aodeSynergy = new AODEClassifier({ featureIds: ['brawler', 'brawler', 'brawler', 'result'], classes: ['victory', 'defeat'], cpts, mpds }, 3)
  let aodeSynergyMse = 0
  for (const row of brawlerDataset) {
    const expected = parseFloat(row['battle.winRate_measure'])
    const values = [...row['battle.team_dimension'], undefined]
    const actual = aodeSynergy.predict('victory', values)
    aodeSynergyMse += Math.pow(expected - actual, 2) / brawlerDataset.length
  }
  console.timeEnd('AODE Synergy benchmark')
  console.log('AODE Synergy MSE', aodeSynergyMse)

  console.time('NB benchmark')
  const nb = new NBClassifier(jpd, 3)
  let nbMse = 0
  for (const row of brawlerDataset) {
    const expected = parseFloat(row['battle.winRate_measure'])
    const values = [...row['battle.team_dimension'], undefined]
    const actual = nb.predict('victory', values)
    nbMse += Math.pow(expected - actual, 2) / brawlerDataset.length
  }
  console.timeEnd('NB benchmark')
  console.log('NB MSE', nbMse)
}

main()
