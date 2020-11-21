import { ClickHouse } from "clickhouse";
import { stripIndent } from "common-tags";
import { QueryBuilder } from "knex";
import { formatClickhouse, getCurrentSeasonEnd, tagToId } from "../lib/util";
import Cube, { DataType, Order } from "./Cube";

/**
 * Player Brawler facts cube
 */
export default class PlayerBrawlerCube extends Cube {
  table = 'brawltime.brawler'

  public playerColumns = stripIndent`
    -- player
    player_id UInt64 Codec(Gorilla, LZ4HC),
    player_tag String Codec(LZ4HC),
    player_name String Codec(LZ4HC),
    player_name_color FixedString(10) Codec(LZ4HC), -- 0x + 8 hex chars
    player_icon_id UInt32 Codec(Gorilla, LZ4HC),
    player_trophies UInt32 Codec(Gorilla, LZ4HC),
    player_highest_trophies UInt32 Codec(Gorilla, LZ4HC),
    player_power_play_points UInt16 Codec(Gorilla, LZ4HC),
    player_highest_power_play_points UInt16 Codec(Gorilla, LZ4HC),
    player_exp_points UInt32 Codec(Gorilla, LZ4HC),
    player_is_qualified_from_championship_challenge UInt8 Codec(Gorilla, LZ4HC),
    player_3vs3_victories UInt32 Codec(Gorilla, LZ4HC),
    player_solo_victories UInt32 Codec(Gorilla, LZ4HC),
    player_duo_victories UInt32 Codec(Gorilla, LZ4HC),
    player_best_robo_rumble_time UInt16 Codec(Gorilla, LZ4HC),
    player_best_time_as_big_brawler UInt16 Codec(Gorilla, LZ4HC),
    -- calculated
    player_brawlers_length UInt8 Codec(Gorilla, LZ4HC),
    -- player club
    player_club_id UInt64 Codec(Gorilla, LZ4HC),
    player_club_tag String Codec(LZ4HC),
    player_club_name String Codec(LZ4HC)
  `

  public brawlerColumns = stripIndent`
    -- brawler
    brawler_id UInt32 Codec(Gorilla, LZ4HC),
    brawler_name LowCardinality(String) Codec(LZ4HC),
    brawler_power UInt8 Codec(Gorilla, LZ4HC),
    brawler_trophies UInt16 Codec(DoubleDelta, LZ4HC), -- trophy change is mostly constant
    brawler_highest_trophies UInt16 Codec(DoubleDelta, LZ4HC),
    -- calculated
    brawler_trophyrange UInt8 Codec(Gorilla, LZ4HC),
    -- starpowers (nested)
    \`brawler_starpowers.id\` Array(UInt32) Codec(LZ4HC),
    \`brawler_starpowers.name\` Array(LowCardinality(String)) Codec(LZ4HC),
    brawler_starpowers_length UInt16 Codec(Gorilla, LZ4HC),
    -- gadgets (nested)
    \`brawler_gadgets.id\` Array(UInt32) Codec(LZ4HC),
    \`brawler_gadgets.name\` Array(LowCardinality(String)) Codec(LZ4HC),
    brawler_gadgets_length UInt16 Codec(Gorilla, LZ4HC)
  `

  public async up(ch2: ClickHouse) {
    await this.execute(ch2, stripIndent`
      CREATE TABLE IF NOT EXISTS ${this.table} (
        -- day without time = 1 record/day
        timestamp Date Codec(DoubleDelta, LZ4HC),
        -- calculated
        trophy_season_end Date Codec(DoubleDelta, LZ4HC),
        ${this.playerColumns},
        ${this.brawlerColumns}
      )
      -- will keep latest version by sorting key
      -- syncs in background so duplicates are possible
      ENGINE = ReplacingMergeTree(timestamp)
      PRIMARY KEY (player_id)
      ORDER BY (player_id, brawler_id, timestamp)
      PARTITION BY trophy_season_end
      SAMPLE BY (player_id)
      -- TTL timestamp + INTERVAL 6 MONTH DELETE
      -- ca. 30 brawlers per player, 30 days
      SETTINGS index_granularity=1024;
    `)
  }

  static defaultMeasures = {
    'picks': 'COUNT(*)',
    'trophy_season_end': 'formatDateTime(MAX(trophy_season_end), \'%FT%TZ\', \'UTC\')',
    'timestamp': 'formatDateTime(MAX(timestamp), \'%FT%TZ\', \'UTC\')',

    'player_name': 'any(player_name)',
    'player_name_color': 'any(player_name_color)',
    'player_icon_id': 'any(player_icon_id)',
    'player_trophies': 'MAX(player_trophies)',
    'player_highest_trophies': 'MAX(player_highest_trophies)',
    'player_power_play_points': 'MAX(player_power_play_points)',
    'player_highest_power_play_points': 'MAX(player_highest_power_play_points)',
    'player_exp_points': 'MAX(player_exp_points)',
    'player_is_qualified_from_championship_challenge': 'MAX(player_is_qualified_from_championship_challenge)',
    'player_3vs3_victories': 'MAX(player_3vs3_victories)',
    'player_solo_victories': 'MAX(player_solo_victories)',
    'player_duo_victories': 'MAX(player_duo_victories)',
    'player_best_robo_rumble_time': 'MAX(player_best_robo_rumble_time)',
    'player_best_time_as_big_brawler': 'MAX(player_best_time_as_big_brawler)',
    'player_brawlers_length': 'MAX(player_brawlers_length)',
    'player_club_id': 'any(player_club_id)',
    'player_club_tag': 'any(player_club_tag)',
    'player_club_name': 'any(player_club_name)',

    'brawler_id': 'any(brawler_id)',
    'brawler_name': 'any(brawler_name)',
    'brawler_power': 'MAX(brawler_power)',
    'brawler_trophies': 'MAX(brawler_trophies)',
    'brawler_highest_trophies': 'MAX(brawler_highest_trophies)',
    'brawler_trophyrange': 'MAX(brawler_trophyrange)',
    'brawler_starpowers_length': 'MAX(brawler_starpowers_length)',
    'brawler_gadgets_length': 'MAX(brawler_gadgets_length)',
  }

  measures = PlayerBrawlerCube.defaultMeasures

  static defaultDimensions = [
    'trophy_season_end',
    'timestamp',
    'player_id',
    'brawler_id',
    'brawler_name',
  ]

  dimensions = PlayerBrawlerCube.defaultDimensions as string[]

  static defaultSlices = {
    'player_id': 1,
    'player_tag': 1,
    'trophy_season_end': 1,
    'brawler_trophyrange': 2,
    'brawler_id': 1,
    'brawler_name': 1,
  }

  slices = PlayerBrawlerCube.defaultSlices

  static defaultMappers = {
    picks: 'int',
    timestamp: 'string',

    player_id: 'int',
    player_tag: 'string',
    player_name: 'string',
    player_name_color: 'string',
    player_icon_id: 'int',
    player_trophies: 'int',
    player_highest_trophies: 'int',
    player_power_play_points: 'int',
    player_highest_power_play_points: 'int',
    player_exp_points: 'int',
    player_is_qualified_from_championship_challenge: 'bool',
    player_3vs3_victories: 'int',
    player_solo_victories: 'int',
    player_duo_victories: 'int',
    player_best_robo_rumble_time: 'int',
    player_best_time_as_big_brawler: 'int',
    player_brawlers_length: 'int',
    player_club_id: 'int',
    player_club_tag: 'string',
    player_club_name: 'string',

    brawler_id: 'int',
    brawler_name: 'string',
    brawler_power: 'int',
    brawler_trophies: 'int',
    brawler_highest_trophies: 'int',
    brawler_trophyrange: 'int',
    brawler_starpowers_length: 'int',
    brawler_gadgets_length: 'int',
  } as Record<string, DataType>

  mappers = PlayerBrawlerCube.defaultMappers

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
        return query.where(`${this.table}.trophy_season_end`, '>=', query.client.raw(`toDateTime(?, 'UTC')`, args[0]))
      case 'brawler_trophyrange':
        if (args[1] == '10') {
          args[1] = '999'
        }
        return query.whereBetween(`${this.table}.brawler_trophyrange`, [parseInt(args[0]), parseInt(args[1])])
      case 'brawler_name':
        return query.where(`${this.table}.brawler_name`, '=', args[0])
      case 'brawler_id':
        return query.where(`${this.table}.brawler_id`, '=', args[0])
      case 'player_id':
        return query.where(`${this.table}.player_id`, '=', args[0])
      case 'player_tag':
        return query.where(`${this.table}.player_id`, '=', tagToId(args[0]))
    }
    throw new Error('Unknown slice name: ' + name)
  }

  virtuals = {} as Record<string, string[]>

  mapVirtual(row: Record<string, string>): Record<string, string|number> {
    return {}
  }
}
