import Cube, { Aggregation, DataType } from "./Cube";
import { QueryBuilder } from "knex";
import { idToTag } from "../lib/util";
import { stripIndent } from "common-tags";

export interface LeaderboardCubeRow {
  timestamp: string
  player_id: string
  player_tag: string
  player_name: string
  player_exp_points: number
  player_trophies: number
  player_power_play_points: number
  player_3vs3_victories: number
  player_solo_victories: number
  player_duo_victories: number
}

export default class LeaderboardCube extends Cube<LeaderboardCubeRow> {
  // TODO: add a TTL and compression
  table = 'brawltime.leaderboard'
  engineDefinition = stripIndent`
    ENGINE = AggregatingMergeTree()
    PARTITION BY tuple()
    ORDER BY (player_id)
  `

  dimensions = [
    'player_id',
    'player_name',
  ]
  dimensionsDefinition = stripIndent`
    player_id UInt64
  `

  measures = {
    'timestamp': 'max',
    'player_exp_points': 'max',
    'player_trophies': 'max',
    'player_power_play_points': 'max',
    'player_3vs3_victories': 'max',
    'player_solo_victories': 'max',
    'player_duo_victories': 'max',
  } as Record<string, Aggregation>

  measuresDefinition = stripIndent`
    timestamp_state AggregateFunction(argMax, DateTime, DateTime),
    player_name_state AggregateFunction(argMax, String, DateTime),
    player_exp_points_state AggregateFunction(argMax, UInt32, DateTime),
    player_trophies_state AggregateFunction(argMax, UInt32, DateTime),
    player_power_play_points_state AggregateFunction(argMax, UInt16, DateTime),
    player_3vs3_victories_state AggregateFunction(argMax, UInt32, DateTime),
    player_solo_victories_state AggregateFunction(argMax, UInt32, DateTime),
    player_duo_victories_state AggregateFunction(argMax, UInt32, DateTime)
  `
  measuresQuery = stripIndent`
    argMaxState(timestamp, timestamp) as timestamp_state,
    argMaxState(player_name, timestamp) as player_name_state,
    argMaxState(player_exp_points, timestamp) as player_exp_points_state,
    argMaxState(player_trophies, timestamp) as player_trophies_state,
    argMaxState(player_power_play_points, timestamp) as player_power_play_points_state,
    argMaxState(player_3vs3_victories, timestamp) as player_3vs3_victories_state,
    argMaxState(player_solo_victories, timestamp) as player_solo_victories_state,
    argMaxState(player_duo_victories, timestamp) as player_duo_victories_state
  `
  measuresAggregation = stripIndent`
    argMaxMerge(timestamp_state) as timestamp,
    argMaxMerge(player_name_state) as player_name,
    argMaxMerge(player_exp_points_state) as player_exp_points,
    argMaxMerge(player_trophies_state) as player_trophies,
    argMaxMerge(player_power_play_points_state) as player_power_play_points,
    argMaxMerge(player_3vs3_victories_state) as player_3vs3_victories,
    argMaxMerge(player_solo_victories_state) as player_solo_victories,
    argMaxMerge(player_duo_victories_state) as player_duo_victories
  `

  slices = {
    'timestamp': 1,
  }

  seedQuery = stripIndent`
    SELECT
      ${this.dimensions.join(',\n')},
      ${this.measuresQuery}
    FROM brawltime.battle
    GROUP BY ${this.dimensions.join(', ')}
  `

  slice(query: QueryBuilder, name: string, args: string[]) {
    switch (name) {
      case 'timestamp':
        return query.where('timestamp', '>=', args[0])
    }
    throw new Error('Unknown slice name: ' + name)
  }

  mappers = {
    timestamp: 'string',
    player_id: 'string',
    // TODO how to select tag? add virtual measures to array
    player_tag: (row: Record<string, string>) => idToTag(row.player_id),
    player_name: 'string',
    player_exp_points: 'int',
    player_trophies: 'int',
    player_power_play_points: 'int',
    player_3vs3_victories: 'int',
    player_solo_victories: 'int',
    player_duo_victories: 'int',
  } as Record<string, DataType>
}
