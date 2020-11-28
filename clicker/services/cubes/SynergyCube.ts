import BrawlerBattleCube, { BrawlerBattleCubeRow } from "./BrawlerBattleCube"
import { stripIndent } from "common-tags"
import { QueryBuilder } from "knex"
import { DataType } from "./Cube"

export interface SynergyMetaCubeRow extends BrawlerBattleCubeRow {
  battle_event_mode: string
  battle_event_map: string
  battle_event_id: number
  ally_brawler_id: number
  ally_brawler_name: string
}

export default class SynergyMetaCube extends BrawlerBattleCube {
  table = 'brawltime.synergy_meta'
  engineDefinition = stripIndent`
    ENGINE = SummingMergeTree()
    PARTITION BY trophy_season_end
    PRIMARY KEY (brawler_trophyrange)
    ORDER BY (brawler_trophyrange, battle_event_mode, battle_event_map, brawler_id, brawler_name, battle_event_id, ally_brawler_id, ally_brawler_name)
  `

  dimensions = [
    ...BrawlerBattleCube.defaultDimensions,
    'battle_event_mode',
    'battle_event_map',
    'battle_event_id',
    'ally_brawler_id',
    'ally_brawler_name',
  ]
  dimensionsDefinition = stripIndent`
    trophy_season_end DateTime,
    brawler_trophyrange UInt8,
    brawler_id UInt32,
    brawler_name LowCardinality(String),
    battle_event_mode LowCardinality(String),
    battle_event_map LowCardinality(String),
    battle_event_id UInt32,
    ally_brawler_id UInt32,
    ally_brawler_name LowCardinality(String)
  `

  // TODO speed data collection up by adding reverse relationships too? (brawler -> ally = -1 * ally -> brawler)
  seedQuery = stripIndent`
    SELECT
      trophy_season_end,
      brawler_trophyrange,
      brawler_id,
      brawler_name,
      battle_event_mode,
      battle_event_map,
      battle_event_id,
      battle_allies.brawler_id as ally_brawler_id,
      battle_allies.brawler_name as ally_brawler_name,
      ${this.measuresQuery}
    FROM brawltime.battle
    ARRAY JOIN battle_allies
    GROUP BY ${this.dimensions.join(', ')}
  `

  slices = {
    'battle_event_mode': 1,
    'battle_event_map': 1,
    'battle_event_id': 1,
    'ally_brawler_id': 1,
    'ally_brawler_name': 1,
    ...BrawlerBattleCube.defaultSlices,
  }

  // TODO deduplicate MapMetaCube code (create a parent class)
  slice(query: QueryBuilder, name: string, args: string[]) {
    switch (name) {
      case 'battle_event_mode':
        return query.where(`${this.table}.battle_event_mode`, '=', args[0])
      case 'battle_event_map':
        return query.where(`${this.table}.battle_event_map`, '=', args[0])
      case 'battle_event_id':
        return query.where(`${this.table}.battle_event_id`, '=', parseInt(args[0]))
      case 'ally_brawler_name':
        return query.where(`${this.table}.ally_brawler_name`, '=', args[0])
      case 'ally_brawler_id':
        return query.where(`${this.table}.ally_brawler_id`, '=', args[0])
    }
    return super.slice(query, name, args)
  }

  mappers = {
    ...BrawlerBattleCube.mappers,
    battle_event_mode: 'string',
    battle_event_map: 'string',
    battle_event_id: 'int',
    ally_brawler_name: 'string',
    ally_brawler_id: 'int',
  } as Record<string, DataType>
}
