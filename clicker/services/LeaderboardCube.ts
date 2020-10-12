import MaterializedCube from "./MaterializedCube";
import { QueryBuilder } from "knex";
import { idToTag } from "../lib/util";
import { stripIndent } from "common-tags";
import { DataType } from "./Cube";

export interface LeaderboardCubeRow {
  timestamp: string
  player_id: string
  player_tag: string
  player_name: string
  player_exp_points: number
  player_3vs3_victories: number
  player_solo_victories: number
  player_duo_victories: number
}

export default class LeaderboardCube extends MaterializedCube {
  table = 'brawltime.leaderboard'
  // no partitions so that players do not end up in duplicate buckets
  engineDefinition = stripIndent`
    ENGINE = AggregatingMergeTree()
    PARTITION BY tuple()
    ORDER BY (player_id)
    TTL timestamp + INTERVAL 1 MONTH
  `

  dimensions = [
    'player_id',
  ]
  dimensionsDefinition = stripIndent`
    player_id UInt64
  `

  measures = {
    'timestamp': 'formatDateTime(MAX(timestamp), \'%FT%TZ\', \'UTC\')',
    'player_name': 'any(player_name)',
    'player_icon_id': 'any(player_icon_id)',
    'player_exp_points': 'MAX(player_exp_points)',
    'player_3vs3_victories': 'MAX(player_3vs3_victories)',
    'player_solo_victories': 'MAX(player_solo_victories)',
    'player_duo_victories': 'MAX(player_duo_victories)',
  }

  // use SimpleAggregateFunction to store only the max
  // this is allowed because exp & victories are increasing counters
  // `any` name will update the name over time
  measuresDefinition = stripIndent`
    timestamp SimpleAggregateFunction(max, DateTime),
    player_name SimpleAggregateFunction(any, String),
    player_icon_id SimpleAggregateFunction(any, UInt32),
    player_exp_points SimpleAggregateFunction(max, UInt32),
    player_3vs3_victories SimpleAggregateFunction(max, UInt32),
    player_solo_victories SimpleAggregateFunction(max, UInt32),
    player_duo_victories SimpleAggregateFunction(max, UInt32)
  `
  measuresQuery = stripIndent`
    MAX(timestamp) as timestamp,
    any(player_name) as player_name,
    any(player_icon_id) as player_icon_id,
    MAX(player_exp_points) as player_exp_points,
    MAX(player_3vs3_victories) as player_3vs3_victories,
    MAX(player_solo_victories) as player_solo_victories,
    MAX(player_duo_victories) as player_duo_victories
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
        return query.where('timestamp', '>=', query.client.raw(`toDateTime(?, 'UTC')`, args[0]))
    }
    throw new Error('Unknown slice name: ' + name)
  }

  mappers = {
    timestamp: 'string',
    player_id: 'string',
    player_name: 'string',
    player_icon_id: 'int',
    player_exp_points: 'int',
    player_3vs3_victories: 'int',
    player_solo_victories: 'int',
    player_duo_victories: 'int',
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
