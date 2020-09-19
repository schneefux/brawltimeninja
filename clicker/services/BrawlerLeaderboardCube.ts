import Cube, { DataType } from "./Cube";
import { QueryBuilder } from "knex";
import { idToTag } from "../lib/util";
import { stripIndent } from "common-tags";

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
  engineDefinition = stripIndent`
    ENGINE = AggregatingMergeTree()
    PARTITION BY tuple()
    ORDER BY (brawler_id, player_id)
  `

  dimensions = [
    'player_id',
    'brawler_id',
  ]
  dimensionsDefinition = `
    player_id UInt64,
    brawler_id UInt32
  `

  measures = {
    'timestamp': 'formatDateTime(argMaxMerge(timestamp_state), \'%FT%TZ\', \'UTC\')',
    'player_name': 'argMaxMerge(player_name_state)',
    'brawler_name': 'argMaxMerge(brawler_name_state)',
    'brawler_power': 'argMaxMerge(brawler_power_state)',
    'brawler_trophies': 'argMaxMerge(brawler_trophies_state)',
    'brawler_highest_trophies': 'argMaxMerge(brawler_highest_trophies_state)',
  }

  measuresDefinition = stripIndent`
    timestamp_state AggregateFunction(argMax, Date, Date),
    player_name_state AggregateFunction(argMax, String, Date),
    brawler_name_state AggregateFunction(argMax, String, Date),
    brawler_power_state AggregateFunction(argMax, UInt8, Date),
    brawler_trophies_state AggregateFunction(argMax, UInt16, Date),
    brawler_highest_trophies_state AggregateFunction(argMax, UInt16, Date)
  `
  measuresQuery = stripIndent`
    argMaxState(timestamp, timestamp) as timestamp_state,
    argMaxState(player_name, timestamp) as player_name_state,
    argMaxState(brawler_name, timestamp) as brawler_name_state,
    argMaxState(brawler_power, timestamp) as brawler_power_state,
    argMaxState(brawler_trophies, timestamp) as brawler_trophies_state,
    argMaxState(brawler_highest_trophies, timestamp) as brawler_highest_trophies_state
  `

  slices = {
    'timestamp': 1,
  }

  seedQuery = stripIndent`
    SELECT
      ${this.dimensions.join(',\n')},
      ${this.measuresQuery}
    FROM brawltime.brawler
    GROUP BY ${this.dimensions.join(', ')}
  `

  slice(query: QueryBuilder, name: string, args: string[]) {
    switch (name) {
      case 'timestamp':
        return query.where('timestamp', '>=', query.client.raw(`toDateTime(?, 'UTC')`, args[0]))
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
