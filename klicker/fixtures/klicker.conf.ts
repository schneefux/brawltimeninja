import { asDimensions, asNumberMeasurements, asSlice, asStringMeasurements, Cube, MetaGridEntry } from "../types"
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

function binomialTest(getK: (d: MetaGridEntry['measurementsRaw']) => number, getN: (d: MetaGridEntry['measurementsRaw']) => number) {
  // approximate a binomial test using the G-test
  return (r: MetaGridEntry['measurementsRaw'], t: MetaGridEntry['measurementsRaw']) => {
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

function binomialCI(getK: (d: MetaGridEntry['measurementsRaw']) => number, getN: (d: MetaGridEntry['measurementsRaw']) => number) {
  // 95% Wilson score interval
  return (d: MetaGridEntry['measurementsRaw']) => {
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

const battleDimensions = asDimensions({
  season: {
    id: 'season',
    name: 'Bi-Week',
    childIds: ['day', 'timestamp'],
    naturalIdAttribute: 'season',
    formatter: 'yyyy-MM-dd',
    additionalMeasures: [],
    type: 'temporal',
    scale: {
      nice: 'week',
    },
    config: {
      sql: 'trophy_season_end',
      type: 'time',
    },
  },
  brawler: {
    id: 'brawler',
    name: 'Brawler',
    childIds: ['gadget', 'starpower', 'gear'],
    naturalIdAttribute: 'brawler',
    formatter: 'capitalizeWords',
    additionalMeasures: [],
    type: 'nominal',
    config: {
      sql: 'brawler_name',
      type: 'string',
    },
  },
  mode: {
    id: 'mode',
    name: 'Mode',
    childIds: ['map'],
    naturalIdAttribute: 'mode',
    formatter: 'formatMode',
    additionalMeasures: [],
    type: 'nominal',
    config: {
      sql: 'battle_event_mode',
      type: 'string',
    },
  },
  map: {
    id: 'map',
    name: 'Map',
    naturalIdAttribute: 'map',
    additionalMeasures: ['mode', 'eventId'],
    type: 'nominal',
    config: {
      sql: 'battle_event_map',
      type: 'string',
    },
  },
  powerplay: {
    id: 'powerplay',
    name: 'Power Play',
    naturalIdAttribute: 'powerplay',
    formatter: 'y/n',
    additionalMeasures: [],
    type: 'nominal',
    config: {
      sql: 'battle_event_powerplay',
      type: 'boolean',
    },
  },
})

const mergedbattleStringMeasurements = asStringMeasurements({
  timestamp: {
    id: 'timestamp',
    name: 'Last Update',
    formatter: 'yyyy-MM-ddTHH:mm',
    sign: -1,
    type: 'temporal',
    config: {
      sql: 'formatDateTime(argMaxMerge(timestamp_state), \'%FT%TZ\', \'UTC\')',
      type: 'number',
    },
  },
})

const mergedbattleNumberMeasurements = asNumberMeasurements({
  picks: {
    id: 'picks',
    name: 'Picks recorded',
    formatter: '.2s',
    d3formatter: '.2s',
    sign: -1,
    type: 'quantitative',
    config: {
      sql: '',
      type: 'count',
    },
  },
  trophyChange: {
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
      sql: 'battle_trophy_change',
      type: 'avg',
    },
  },
  winRate: {
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
    config: {
      sql: 'avgMerge(battle_victory_state)',
      type: 'number',
    },
    statistics: {
      test: {
        name: 'G-Test',
        test: binomialTest(m => (m['winRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
        requiresMeasurements: ['picks'],
    },
      ci: {
        ci: binomialCI(m => (m['winRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
        requiresMeasurements: ['picks'],
      },
    },
  },
  starRate: {
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
        requiresMeasurements: ['picks'],
    },
      ci: {
        ci: binomialCI(m => (m['starRate'] as number) * (m['picks'] as number), m => m['picks'] as number),
        requiresMeasurements: ['picks'],
      },
    },
  },
  duration: {
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
  },
})

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
      battleDimensions.season,
      battleDimensions.brawler,
      battleDimensions.mode,
      battleDimensions.map,
      battleDimensions.powerplay,
    ],
    defaultDimensionsIds: ['brawler'],
    measurements: [
      mergedbattleStringMeasurements.timestamp,
      mergedbattleNumberMeasurements.picks,
      mergedbattleNumberMeasurements.trophyChange,
      mergedbattleNumberMeasurements.winRate,
      mergedbattleNumberMeasurements.starRate,
      mergedbattleNumberMeasurements.duration,
    ],
    defaultMeasurementIds: ['winRateAdj'],
    metaMeasurements: ['picks', 'timestamp'],
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
