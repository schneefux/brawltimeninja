import Cube, { Aggregation, DataType } from "./Cube";
import { QueryBuilder } from "knex";
import { idToTag } from "../lib/util";

export interface BrawlerLeaderboardCubeRow {
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

export default class BrawlerLeaderboardCube extends Cube<BrawlerLeaderboardCubeRow> {
  // TODO: add a TTL and compression
  table = 'brawltime.brawler_leaderboard'
  engineDefinition = `
    ENGINE = AggregatingMergeTree()
    PARTITION BY tuple()
    ORDER BY (brawler_id, player_id)
  `

  dimensions = [
    'player_id',
    'player_name',
    'brawler_id',
    'brawler_name',
  ]
  dimensionsDefinition = `
    player_id UInt64,
    brawler_id UInt32
  `

  measures = {
    'timestamp': 'max',
    'brawler_power': 'max',
    'brawler_trophies': 'max',
    'brawler_highest_trophies': 'max',
  } as Record<string, Aggregation>

  measuresDefinition = `
    timestamp_state AggregateFunction(argMax, Date, Date),
    player_name_state AggregateFunction(argMax, String, Date),
    brawler_name_state AggregateFunction(argMax, String, Date),
    brawler_power_state AggregateFunction(argMax, UInt8, Date),
    brawler_trophies_state AggregateFunction(argMax, UInt16, Date),
    brawler_highest_trophies_state AggregateFunction(argMax, UInt16, Date)
  `
  measuresQuery = `
    argMaxState(timestamp, timestamp) as timestamp_state,
    argMaxState(player_name, timestamp) as player_name_state,
    argMaxState(brawler_name, timestamp) as brawler_name_state,
    argMaxState(brawler_power, timestamp) as brawler_power_state,
    argMaxState(brawler_trophies, timestamp) as brawler_trophies_state,
    argMaxState(brawler_highest_trophies, timestamp) as brawler_highest_trophies_state
  `
  measuresAggregation = `
    argMaxMerge(timestamp_state) as timestamp,
    argMaxMerge(player_name_state) as player_name,
    argMaxMerge(brawler_name_state) as brawler_name,
    argMaxMerge(brawler_power_state) as brawler_power,
    argMaxMerge(brawler_trophies_state) as brawler_trophies,
    argMaxMerge(brawler_highest_trophies_state) as brawler_highest_trophies
  `

  slices = {
    'timestamp': 1,
  }

  seedQuery = `
    SELECT
      ${this.dimensions.join(',\n')},
      ${this.measuresQuery}
    FROM brawltime.brawler
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
    brawler_id: 'string',
    brawler_name: 'string',
    brawler_power: 'int',
    brawler_trophies: 'int',
    brawler_highest_trophies: 'int',
  } as Record<string, DataType>
}
