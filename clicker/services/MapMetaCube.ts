import BrawlerBattleCube, { BrawlerBattleCubeRow } from "./BrawlerBattleCube"
import { stripIndent } from "common-tags"
import { QueryBuilder } from "knex"
import { DataType } from "./Cube"

export interface MapMetaCubeRow extends BrawlerBattleCubeRow {
  battle_event_mode: string
  battle_event_map: string
  battle_event_id: number
  battle_event_powerplay: boolean
  battle_is_bigbrawler: boolean
}

export default class MapMetaCube extends BrawlerBattleCube {
  table = 'brawltime.map_meta'
  engineDefinition = stripIndent`
    ENGINE = SummingMergeTree()
    PARTITION BY trophy_season_end
    PRIMARY KEY (brawler_trophyrange)
    ORDER BY (brawler_trophyrange, battle_event_mode, battle_event_map, brawler_name, battle_event_id, battle_event_powerplay, battle_is_bigbrawler)
  `

  dimensions = [
    'trophy_season_end',
    'brawler_trophyrange',
    'brawler_name',
    'battle_event_mode',
    'battle_event_map',
    'battle_event_id',
    'battle_event_powerplay',
    'battle_is_bigbrawler',
  ]
  dimensionsDefinition = stripIndent`
    trophy_season_end DateTime,
    brawler_trophyrange UInt8,
    brawler_name LowCardinality(String),
    battle_event_mode LowCardinality(String),
    battle_event_map LowCardinality(String),
    battle_event_id UInt32,
    battle_event_powerplay UInt8,
    battle_is_bigbrawler UInt8
  `

  // FIXME this gives every ally the same trophyrange, trophychange and pick weight which might not be true
  // ally bigbrawler being the same is ok because the bigbrawler is in the opposing team or has no allies
  // TODO add brawler_id to dimensions
  // materialized views do not support UNION so can't add brawler to allies
  seedQuery = stripIndent`
    SELECT
      trophy_season_end,
      brawler_trophyrange,
      arrayJoin(arrayConcat(battle_allies.brawler_name, [brawler_name])) AS brawler_name,
      battle_event_mode,
      battle_event_map,
      battle_event_id,
      battle_event_powerplay,
      assumeNotNull(battle_is_bigbrawler) AS battle_is_bigbrawler,
      ${this.measuresQuery}
    FROM brawltime.battle
    GROUP BY ${this.dimensions.join(', ')}
  `

  slices = {
    'battle_event_mode': 1,
    'battle_event_map': 1,
    'battle_event_id': 1,
    'battle_event_powerplay': 1,
    'battle_battle_is_bigbrawler': 1,
    ...BrawlerBattleCube.defaultSlices,
  }

  slice(query: QueryBuilder, name: string, args: string[]) {
    switch (name) {
      case 'battle_event_mode':
        return query.where('battle_event_mode', '=', args[0])
      case 'battle_event_map':
        return query.where('battle_event_map', '=', args[0])
      case 'battle_event_id':
        return query.where('battle_event_id', '=', parseInt(args[0]))
      case 'battle_event_powerplay':
        return query.where('battle_event_powerplay', '=', args[0] == 'true' ? 1 : 0)
      case 'battle_is_bigbrawler':
        return query.where('battle_is_bigbrawler', '=', args[0] == 'true' ? 1 : 0)
    }
    return super.slice(query, name, args)
  }

  mappers = {
    ...BrawlerBattleCube.mappers,
    battle_event_mode: 'string',
    battle_event_map: 'string',
    battle_event_id: 'int',
    battle_event_powerplay: 'bool',
    battle_is_bigbrawler: 'bool',
  } as Record<string, DataType>
}
