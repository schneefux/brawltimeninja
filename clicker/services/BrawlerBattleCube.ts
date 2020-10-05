import Cube from "./MaterializedCube";
import { QueryBuilder } from "knex";
import { stripIndent } from "common-tags";
import { formatClickhouse, getCurrentSeasonEnd } from "../lib/util";
import { DataType } from "./Cube";

export interface BrawlerBattleCubeMeasures {
  timestamp: string
  picks: number
  picks_weighted: number
  battle_rank: number
  battle_rank1: number
  battle_victory: number
  battle_duration: number
  battle_starplayer: number
  battle_level: number
  battle_trophy_change: number
}

export interface BrawlerBattleCubeDimensions {
  trophy_season_end: string
  brawler_trophyrange: number
  brawler_id: number
  brawler_name: string
}

export interface BrawlerBattleCubeRow extends BrawlerBattleCubeMeasures, BrawlerBattleCubeDimensions {
}

/**
 * All Brawler Battle cubes share the same measures and have common dimensions.
 */
export default abstract class BrawlerBattleCube extends Cube {
  measures = {
    'timestamp': 'formatDateTime(argMaxMerge(timestamp_state), \'%FT%TZ\', \'UTC\')',
    'picks': 'SUM(picks)',
    'picks_weighted': 'SUM(picks_weighted)',
    'battle_rank': 'avgMerge(battle_rank_state)',
    'battle_rank1': 'avgMerge(battle_rank1_state)',
    'battle_victory': 'avgMerge(battle_victory_state)',
    'battle_duration': 'avgMerge(battle_duration_state)',
    'battle_starplayer': 'avgMerge(battle_starplayer_state)',
    'battle_level': 'avgMerge(battle_level_state)',
    'battle_trophy_change': 'avgMerge(battle_trophy_change_state)',
  }

  static defaultDimensions = [
    'trophy_season_end',
    'brawler_trophyrange',
    'brawler_id',
    'brawler_name',
  ]

  static defaultSlices = {
    'trophy_season_end': 1,
    'brawler_trophyrange': 2,
    'brawler_id': 1,
    'brawler_name': 1,
  }

  slices = BrawlerBattleCube.defaultSlices

  slice(query: QueryBuilder, name: string, args: string[]) {
    switch (name) {
      case 'trophy_season_end':
        if (args[0] == 'current') {
          args[0] = formatClickhouse(getCurrentSeasonEnd())
        }
        if (args[0] == 'balance') {
          args[0] = formatClickhouse(this.balanceChangesDate)
        }
        if (args[0] == 'month') {
          const oneMonthAgo = new Date()
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
          args[0] = formatClickhouse(oneMonthAgo)
        }
        return query.where('trophy_season_end', '>=', query.client.raw(`toDateTime(?, 'UTC')`, args[0]))
      case 'brawler_trophyrange':
        if (args[1] == '10') {
          args[1] = '999'
        }
        return query.whereBetween('brawler_trophyrange', [parseInt(args[0]), parseInt(args[1])])
      case 'brawler_name':
        return query.where('brawler_name', '=', args[0])
      case 'brawler_id':
        return query.where('brawler_id', '=', args[0])
    }
    throw new Error('Unknown slice name: ' + name)
  }

  static mappers = {
    trophy_season_end: 'string',
    brawler_trophyrange: 'int',
    brawler_name: 'string',
    brawler_id: 'int',

    timestamp: 'string',

    picks: 'int',
    picks_weighted: 'int',
    battle_rank: 'float',
    battle_rank1: 'float',
    battle_victory: 'float',
    battle_duration: 'float',
    battle_starplayer: 'float',
    battle_level: 'float',
    battle_trophy_change: 'float',
  } as Record<string, DataType>

  measuresDefinition = stripIndent`
    timestamp_state AggregateFunction(argMax, DateTime, DateTime),
    picks UInt64,
    picks_weighted UInt64,
    battle_duration_state AggregateFunction(avg, UInt16),
    battle_rank_state AggregateFunction(avg, UInt8),
    battle_rank1_state AggregateFunction(avg, UInt8),
    battle_victory_state AggregateFunction(avg, Decimal32(8)),
    battle_starplayer_state AggregateFunction(avg, UInt8),
    battle_level_state AggregateFunction(avg, UInt16),
    battle_trophy_change_state AggregateFunction(avg, Int8)
  `

  // *state must have same data type as source column
  measuresQuery = stripIndent`
    argMaxState(timestamp, timestamp) as timestamp_state,
    COUNT(*) AS picks,
    SUM(player_brawlers_length) AS picks_weighted,
    avgState(battle_duration) AS battle_duration_state,
    avgState(battle_rank) AS battle_rank_state,
    avgState(brawltime.battle.battle_rank=1) AS battle_rank1_state,
    avgState(battle_victory) AS battle_victory_state,
    avgState(brawler_name=battle_starplayer_brawler_name) AS battle_starplayer_state,
    avgState(battle_level_id) AS battle_level_state,
    avgState(battle_trophy_change) as battle_trophy_change_state
  `

  virtuals = {
    wins: ['picks', 'battle_victory'],
  } as Record<string, string[]>

  mapVirtual(row: Record<string, string>): Record<string, string|number> {
    if ('picks' in row && 'battle_victory' in row) {
      return {
        wins: Math.floor(parseInt(row.picks) * parseFloat(row.battle_victory)),
      }
    }
    return {}
  }
}
