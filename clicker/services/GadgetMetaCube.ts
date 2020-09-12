import BrawlerBattleCube, { BrawlerBattleCubeRow } from "./BrawlerBattleCube";
import { DataType } from "./Cube";

export interface GadgetMetaCubeRow extends BrawlerBattleCubeRow {
  brawler_id: number
  brawler_gadget_id: number
  brawler_gadget_name: string
}

export default class GadgetMetaCube extends BrawlerBattleCube<GadgetMetaCubeRow> {
  table = 'brawltime.gadget_meta'
  engineDefinition = `
    ENGINE = SummingMergeTree()
    PARTITION BY trophy_season_end
    PRIMARY KEY (brawler_trophyrange)
    ORDER BY (brawler_trophyrange, brawler_id, brawler_name, brawler_gadget_id, brawler_gadget_name)
  `

  dimensions = [
    'trophy_season_end',
    'brawler_trophyrange',
    'brawler_id',
    'brawler_name',
    'brawler_gadget_id',
    'brawler_gadget_name',
  ]
  dimensionsDefinition = `
    trophy_season_end DateTime,
    brawler_trophyrange UInt8,
    brawler_id UInt32,
    brawler_name LowCardinality(String),
    brawler_gadget_id UInt32,
    brawler_gadget_name LowCardinality(String)
  `

  seedQuery = `
    SELECT
      trophy_season_end,
      brawler_trophyrange,
      brawler_id,
      brawler_name,
      brawler_gadget_id,
      brawler_gadget_name,
      ${this.measuresQuery}
    FROM brawltime.battle
    WHERE brawler_gadgets_length <= 1
    GROUP BY ${this.dimensions.join(', ')}
  `

  mappers = {
    ...BrawlerBattleCube.mappers,
    brawler_id: 'int',
    brawler_gadget_id: 'int',
    brawler_gadget_name: 'string',
  } as Record<string, DataType>
}
