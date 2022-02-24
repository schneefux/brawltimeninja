import { asSlice, Cube, Dimension, MetaGridEntry, Metric } from "../types"
import { ChiSquared } from 'sampson'

function calculateGTestStatistic(expectations: number[], observations: number[]) {
  if (expectations.length != observations.length) {
    throw new Error(`Invalid chisq test, cardinality of expectations ${expectations.length} does not match cardinality of observations ${observations.length}`)
  }

  let g = 0
  for (let i = 0; i < observations.length; i++) {
    g += observations[i] * Math.log(observations[i] / expectations[i])
  }

  return 2*g
}

function binomialTest(getK: (d: MetaGridEntry['metricsRaw']) => number, getN: (d: MetaGridEntry['metricsRaw']) => number) {
  // approximate a binomial test using the G-test
  return (r: MetaGridEntry['metricsRaw'], t: MetaGridEntry['metricsRaw']) => {
    const total = getN(r) + getN(t)
    const totalSuccesses = getK(r) + getK(t)
    const totalFailures = total - totalSuccesses

    const expectedSuccessesR = getN(r) * totalSuccesses / total
    const expectedFailuresR = getN(r) * totalFailures / total
    const expectedSuccessesT = getN(t) * totalSuccesses / total
    const expectedFailuresT = getN(t) * totalFailures / total

    const observedSuccessesR = getK(r)
    const observedFailuresR = getN(r) - getK(r)
    const observedSuccessesT = getK(t)
    const observedFailuresT = getN(t) - getK(t)

    const g = calculateGTestStatistic(
      [expectedSuccessesR, expectedFailuresR, expectedSuccessesT, expectedFailuresT],
      [observedSuccessesR, observedFailuresR, observedSuccessesT, observedFailuresT])

    // @ts-ignore
    return ChiSquared.pdf(g, {
      // df: (rows - 1) * (columns - 1)
      df: 1
    })
  }
}

function binomialCI(getK: (d: MetaGridEntry['metricsRaw']) => number, getN: (d: MetaGridEntry['metricsRaw']) => number) {
  // 95% Wilson score interval
  return (d: MetaGridEntry['metricsRaw']) => {
    const z = 1.96

    const n = getN(d)
    const ns = getK(d)
    const nf = n - ns
    const z2 = Math.pow(z, 2)

    const base = (ns + 0.5*z2) / (n + z2)
    const diff = z/(n + z2) * Math.sqrt( (ns*nf)/n + z2/4 )

    return {
      lower: Math.max(0.0, base - diff),
      mean: (ns + 2) / (n + 4),
      upper: Math.min(1.0, base + diff),
    }
  }
}

const seasonDimension: Dimension = {
  id: 'season',
  name: 'Bi-Week',
  childIds: ['day', 'timestamp'],
  naturalIdAttribute: 'season',
  formatter: 'yyyy-MM-dd',
  additionalMetrics: [],
  type: 'temporal',
  scale: {
    nice: 'week',
  },
  config: {
    sql: 'trophy_season_end',
    type: 'time',
  },
}

const brawlerDimension: Dimension = {
  id: 'brawler',
  name: 'Brawler',
  childIds: ['gadget', 'starpower', 'gear'],
  naturalIdAttribute: 'brawler',
  formatter: 'capitalizeWords',
  additionalMetrics: [],
  type: 'nominal',
  config: {
    sql: 'brawler_name',
    type: 'string',
  },
}

const modeDimension: Dimension = {
  id: 'mode',
  name: 'Mode',
  childIds: ['map'],
  naturalIdAttribute: 'mode',
  formatter: 'formatMode',
  additionalMetrics: [],
  type: 'nominal',
  config: {
    sql: 'battle_event_mode',
    type: 'string',
  },
}

const mapDimension: Dimension = {
  id: 'map',
  name: 'Map',
  naturalIdAttribute: 'map',
  additionalMetrics: ['mode', 'eventId'],
  type: 'nominal',
  config: {
    sql: 'battle_event_map',
    type: 'string',
  },
}

const powerplayDimension: Dimension = {
  id: 'powerplay',
  name: 'Power Play',
  naturalIdAttribute: 'powerplay',
  formatter: 'y/n',
  additionalMetrics: [],
  type: 'nominal',
  config: {
    sql: 'battle_event_powerplay',
    type: 'boolean',
  },
}

const timestampMergedMetric: Metric = {
  id: 'timestamp',
  name: 'Last Update',
  formatter: 'yyyy-MM-ddTHH:mm',
  sign: -1,
  type: 'temporal',
  config: {
    sql: 'formatDateTime(argMaxMerge(timestamp_state), \'%FT%TZ\', \'UTC\')',
    type: 'number',
  },
}

const picksMergedMetric: Metric = {
  id: 'picks',
  name: 'Picks recorded',
  formatter: '.2s',
  d3formatter: '.2s',
  sign: -1,
  type: 'quantitative',
  config: {
    sql: 'sum(picks)',
    type: 'number',
  },
}

const trophyChangeMergedMetric: Metric = {
  id: 'trophyChange',
  name: 'Trophy Change',
  formatter: '+.2f',
  d3formatter: '+.2f',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'avgMerge(battle_trophy_change_state)',
    type: 'number',
  },
}

const makeWinRateMetric = (config: Metric['config']): Metric => {
  return {
    id: 'winRate',
    name: 'Win Rate',
    description: 'The Win Rate tells you the % of battles a Brawler wins or ranks high.',
    formatter: '.1%',
    d3formatter: '.1%',
    sign: -1,
    type: 'quantitative',
    vega: {
      scale: {
        zero: false,
      },
    },
    config,
    statistics: {
      test: {
        name: 'G-Test',
        test: binomialTest(m => (m['winRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
        requiresMetrics: ['picks'],
      },
      ci: {
        ci: binomialCI(m => (m['winRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
        requiresMetrics: ['picks'],
      },
    },
  }
}

const winRateMergedMetric = makeWinRateMetric({
  sql: 'avgMerge(battle_victory_state)',
  type: 'number',
})

const starRateMergedMetric: Metric = {
  id: 'starRate',
  name: 'Star Player',
  description: 'The Star Rate tells you the % of battles this Brawler becomes Star Player.',
  formatter: '.1%',
  d3formatter: '.1%',
  sign: -1,
  type: 'quantitative',
  vega: {
    scale: {
      zero: false,
    },
  },
  config: {
    sql: 'avgMerge(battle_starplayer_state)',
    type: 'number',
  },
  statistics: {
    test: {
      name: 'G-Test',
      test: binomialTest(m => (m['starRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
      requiresMetrics: ['picks'],
  },
    ci: {
      ci: binomialCI(m => (m['starRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
      requiresMetrics: ['picks'],
    },
  },
}

const durationMergedMetric: Metric = {
  id: 'duration',
  name: 'Duration',
  description: 'The Duration tells you how long battles with this Brawler last on average in seconds.',
  formatter: 'duration',
  d3formatter: 'duration',
  sign: +1,
  type: 'quantitative',
  config: {
    sql: 'avgMerge(battle_duration_state)',
    type: 'number',
  },
}

const battleSlices = asSlice({
  seasonBetween: {
    id: 'seasonBetween',
    config: {
      member: 'season_dimension',
      operator: 'inDateRange',
    }
  },
  mode: {
    id: 'mode',
    config: {
      member: 'mode_dimension',
      operator: 'equals',
    },
  },
  map: {
    id: 'map',
    config: {
      member: 'map_dimension',
      operator: 'equals',
    },
  },
})

const cubes: Record<string, Cube> = {
  map: {
    id: 'map',
    table: 'map_meta',
    name: 'Map',
    dimensions: [
      seasonDimension,
      brawlerDimension,
      modeDimension,
      mapDimension,
      powerplayDimension,
    ],
    defaultDimensionsIds: ['brawler'],
    metrics: [
      timestampMergedMetric,
      picksMergedMetric,
      trophyChangeMergedMetric,
      winRateMergedMetric,
      starRateMergedMetric,
      durationMergedMetric,
    ],
    defaultMetricIds: ['winRateAdj'],
    metaMetrics: ['picks', 'timestamp'],
    slices: [
      battleSlices.seasonBetween,
      battleSlices.mode,
      battleSlices.map,
    ],
    defaultSliceValues: {
      seasonBetween: ['2021-11-01', '2021-12-31'],
    },
  },
}

export default cubes
