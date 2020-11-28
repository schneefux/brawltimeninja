import MaterializedCube from "./MaterializedCube";
import { QueryBuilder } from "knex";
import { idToTag } from "../../lib/util";
import { stripIndent } from "common-tags";
import { DataType } from "./Cube";

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

export default class BrawlerLeaderboardCube extends MaterializedCube {
  // similar to LeaderboardCube
  table = 'brawltime.brawler_leaderboard'
  engineDefinition = stripIndent`
    ENGINE = AggregatingMergeTree()
    PARTITION BY tuple()
    ORDER BY (brawler_id, player_id)
    TTL timestamp + INTERVAL 1 MONTH
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
    'timestamp': 'formatDateTime(MAX(timestamp), \'%FT%TZ\', \'UTC\')',
    'player_name': 'any(player_name)',
    'player_icon_id': 'any(player_icon_id)',
    'brawler_name': 'any(brawler_name)',
    'brawler_highest_trophies': 'MAX(brawler_highest_trophies)',
  }

  measuresDefinition = stripIndent`
    timestamp SimpleAggregateFunction(max, Date),
    player_name SimpleAggregateFunction(any, String),
    player_icon_id SimpleAggregateFunction(any, UInt32),
    brawler_name SimpleAggregateFunction(any, String),
    brawler_highest_trophies SimpleAggregateFunction(max, UInt16)
  `
  measuresQuery = stripIndent`
    MAX(timestamp) as timestamp,
    any(player_name) as player_name,
    any(player_icon_id) as player_icon_id,
    any(brawler_name) as brawler_name,
    MAX(brawler_highest_trophies) as brawler_highest_trophies
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
        return query.where(`${this.table}.timestamp`, '>=', query.client.raw(`toDateTime(?, 'UTC')`, args[0]))
    }
    throw new Error('Unknown slice name: ' + name)
  }

  mappers = {
    timestamp: 'string',
    player_id: 'string',
    player_name: 'string',
    player_icon_id: 'int',
    brawler_id: 'string',
    brawler_name: 'string',
    brawler_highest_trophies: 'int',
  } as Record<string, DataType>

  virtuals = {
    player_tag: ['player_id'],
  } as Record<string, string[]>

  mapVirtual(row: Record<string, string>): Record<string, string> {
    if ('player_id' in row) {
      return {
        player_tag: idToTag(row.player_id),
      }
    }
    return {}
  }
}
