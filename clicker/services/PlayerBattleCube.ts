import { ClickHouse } from "clickhouse";
import { stripIndent } from "common-tags";
import { QueryBuilder } from "knex";
import { DataType } from "./Cube";
import PlayerBrawlerCube from "./PlayerBrawlerCube";

/**
 * Player Battle facts cube
 */
export default class PlayerBattleCube extends PlayerBrawlerCube {
  table = 'brawltime.battle'

  public async up(ch2: ClickHouse) {
    // TODO on next table rewrite, use ReplacingMergeTree
    await this.execute(ch2, stripIndent`
      CREATE TABLE IF NOT EXISTS brawltime.battle (
        timestamp DateTime Codec(DoubleDelta, LZ4HC),
        -- calculated
        trophy_season_end DateTime Codec(DoubleDelta, LZ4HC),
        ${this.playerColumns},
        -- player brawler
        -- see other table
        ${this.brawlerColumns},
        -- brawler active starpower
        brawler_starpower_found UInt8 Codec(Gorilla, LZ4HC),
        brawler_starpower_id UInt32 Codec(LZ4HC),
        brawler_starpower_name LowCardinality(String) Codec(LZ4HC),
        -- brawler active gadget
        brawler_gadget_found UInt8 Codec(Gorilla, LZ4HC),
        brawler_gadget_id UInt32 Codec(LZ4HC),
        brawler_gadget_name LowCardinality(String) Codec(LZ4HC),
        -- battle event
        battle_event_id UInt32 Codec(Gorilla, LZ4HC),
        battle_event_mode LowCardinality(String) Codec(LZ4HC),
        battle_event_map LowCardinality(String) Codec(LZ4HC),
        battle_event_powerplay UInt8 Codec(Gorilla, LZ4HC),
        -- battle
        -- mode: ommitted because duplicate
        battle_type LowCardinality(String) Codec(LZ4HC),
        battle_result LowCardinality(String) Codec(LZ4HC),
        -- Nullable + Encoding is not supported
        battle_duration Nullable(UInt16) Codec(LZ4HC),
        battle_rank Nullable(UInt8) Codec(LZ4HC),
        battle_trophy_change Nullable(Int8) Codec(LZ4HC),
        battle_level_name LowCardinality(String) Codec(LZ4HC),
        battle_level_id Nullable(UInt16) Codec(LZ4HC),
        -- calculated
        battle_victory Nullable(Decimal32(8)) Codec(LZ4HC),
        -- battle starplayer
        battle_starplayer_brawler_id UInt32 Codec(LZ4HC),
        battle_starplayer_brawler_name LowCardinality(String) Codec(LZ4HC),
        battle_starplayer_brawler_power UInt8 Codec(Gorilla, LZ4HC),
        battle_starplayer_brawler_trophies UInt16 Codec(Gorilla, LZ4HC),
        -- calculated
        battle_is_starplayer Nullable(UInt8) Codec(LZ4HC),
        -- battle big brawler
        battle_bigbrawler_brawler_id UInt32 Codec(LZ4HC),
        battle_bigbrawler_brawler_name LowCardinality(String) Codec(LZ4HC),
        battle_bigbrawler_brawler_power UInt8 Codec(Gorilla, LZ4HC),
        battle_bigbrawler_brawler_trophies UInt16 Codec(Gorilla, LZ4HC),
        -- calculated
        battle_is_bigbrawler Nullable(UInt8) Codec(LZ4HC),
        -- battle allies and enemies (nested)
        -- player names and tags ommitted, not needed
        \`battle_allies.brawler_id\` Array(UInt32) Codec(LZ4HC),
        \`battle_allies.brawler_name\` Array(LowCardinality(String)) Codec(LZ4HC),
        \`battle_allies.brawler_power\` Array(UInt8) Codec(LZ4HC),
        \`battle_allies.brawler_trophies\` Array(UInt16) Codec(LZ4HC),
        \`battle_enemies.brawler_id\` Array(UInt32) Codec(LZ4HC),
        \`battle_enemies.brawler_name\` Array(LowCardinality(String)) Codec(LZ4HC),
        \`battle_enemies.brawler_power\` Array(UInt8) Codec(LZ4HC),
        \`battle_enemies.brawler_trophies\` Array(UInt16) Codec(LZ4HC)
      )
      ENGINE = MergeTree()
      -- there are no unique checks!
      -- memory consumption for the index is partition cardinality * pk size * pk cardinality / index granularity
      PRIMARY KEY (player_id)
      ORDER BY (player_id, timestamp)
      PARTITION BY trophy_season_end
      SAMPLE BY (player_id)
      -- TTL timestamp + INTERVAL 1 MONTH DELETE
      -- 25 battles per battle log query
      SETTINGS index_granularity=25;
    `)

    // backwards compat
    await this.execute(ch2, stripIndent`
      ALTER TABLE brawltime.battle ADD COLUMN IF NOT EXISTS battle_event_powerplay UInt8 Codec(Gorilla, LZ4HC) AFTER battle_event_map
    `)
  }

  dimensions = [
    PlayerBrawlerCube.defaultDimensions,
    'battle_event_id',
    'battle_event_mode',
    'battle_event_map',
    'battle_event_powerplay',
    // TODO add allies and enemies as dimensions?
  ] as string[]

  measures = {
    ...PlayerBrawlerCube.defaultMeasures,

    'brawler_starpower_found': 'MAX(brawler_starpower_found)',
    'brawler_starpower_id': 'MAX(brawler_starpower_id)',
    'brawler_starpower_name': 'any(brawler_starpower_name)',
    'brawler_gadget_found': 'MAX(brawler_gadget_found)',
    'brawler_gadget_id': 'MAX(brawler_gadget_id)',
    'brawler_gadget_name': 'any(brawler_gadget_name)',
    'battle_event_powerplay': 'AVG(battle_event_powerplay)',
    'battle_duration': 'AVG(battle_duration)',
    'battle_rank': 'AVG(battle_rank)',
    'battle_trophy_change': 'AVG(battle_trophy_change)',
    'battle_victory': 'AVG(battle_victory)',
  }

  mappers = {
    ...PlayerBrawlerCube.defaultMappers,
    'brawler_starpower_found': 'bool',
    'brawler_starpower_id': 'int',
    'brawler_starpower_name': 'string',
    'brawler_gadget_found': 'bool',
    'brawler_gadget_id': 'int',
    'brawler_gadget_name': 'string',
    'battle_event_id': 'int',
    'battle_event_mode': 'string',
    'battle_event_map': 'string',
    'battle_event_powerplay': 'bool',
    'battle_type': 'string',
    'battle_result': 'string',
    'battle_duration': 'float',
    'battle_rank': 'float',
    'battle_trophy_change': 'float',
    'battle_victory': 'float',
    // ...TODO
  } as Record<string, DataType>

  slices = {
    ...PlayerBrawlerCube.defaultSlices,
    'battle_event_id': 1,
    'battle_event_mode': 1,
    'battle_event_map': 1,
    'battle_event_powerplay': 1,
  }

  slice(query: QueryBuilder, name: string, args: string[]) {
    switch (name) {
      case 'battle_event_mode':
        return query.where(`${this.table}.battle_event_mode`, '=', args[0])
      case 'battle_event_map':
        return query.where(`${this.table}.battle_event_map`, '=', args[0])
      case 'battle_event_id':
        return query.where(`${this.table}.battle_event_id`, '=', parseInt(args[0]))
      case 'battle_event_powerplay':
        return query.where(`${this.table}.battle_event_powerplay`, '=', args[0] == 'true' ? 1 : 0)
    }
    return super.slice(query, name, args)
  }
}
