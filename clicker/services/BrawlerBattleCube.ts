import Cube, { Aggregation, DataType } from "./Cube";
import { QueryBuilder } from "knex";
import { stripIndent } from "common-tags";

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
  brawler_name: string
}

export interface BrawlerBattleCubeRow extends BrawlerBattleCubeMeasures, BrawlerBattleCubeDimensions {
}

/**
 * All Brawler Battle cubes share the same measures and have common dimensions.
 */
export default abstract class BrawlerBattleCube<R extends BrawlerBattleCubeRow> extends Cube<R> {
  measures = {
    'timestamp': 'max',
    'picks': 'count',
    'picks_weighted': 'sum',
    'battle_rank': 'avg',
    'battle_rank1': 'avg',
    'battle_victory': 'avg',
    'battle_duration': 'avg',
    'battle_starplayer': 'avg',
    'battle_level': 'avg',
    'battle_trophy_change': 'avg',
  } as { [name: string]: Aggregation }

  dimensions = [
    'trophy_season_end',
    'brawler_trophyrange',
    'brawler_name',
  ]

  slices = {
    'trophy_season_end': 1,
    'brawler_trophyrange': 2,
    'brawler_name': 1,
  }

  slice(query: QueryBuilder, name: string, args: string[]) {
    switch (name) {
      case 'trophy_season_end':
        return query.where('trophy_season_end', '>=', query.client.raw(`toDateTime(?, 'UTC')`, args[0]))
      case 'brawler_trophyrange':
        return query.whereBetween('brawler_trophyrange', [parseInt(args[0]), parseInt(args[1])])
      case 'brawler_name':
        return query.where('brawler_name', '=', args[0])
    }
    throw new Error('Unknown slice name: ' + name)
  }

  static mappers = {
    trophy_season_end: 'string',
    brawler_trophyrange: 'int',
    brawler_name: 'string',

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
  measuresAggregation = stripIndent`
    argMaxMerge(timestamp_state) as timestamp,
    SUM(picks) AS picks,
    SUM(picks_weighted) AS picks_weighted,
    avgMerge(battle_rank_state) AS battle_rank,
    avgMerge(battle_rank1_state) AS battle_rank1,
    avgMerge(battle_victory_state) AS battle_victory,
    avgMerge(battle_duration_state) AS battle_duration,
    avgMerge(battle_starplayer_state) AS battle_starplayer,
    avgMerge(battle_level_state) AS battle_level,
    avgMerge(battle_trophy_change_state) AS battle_trophy_change
  `
}
