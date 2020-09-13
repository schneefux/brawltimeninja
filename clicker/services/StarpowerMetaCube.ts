import BrawlerBattleCube, { BrawlerBattleCubeRow } from "./BrawlerBattleCube";
import { DataType } from "./Cube";
import { stripIndent } from "common-tags";

export interface StarpowerMetaCubeRow extends BrawlerBattleCubeRow {
  brawler_id: number
  brawler_starpower_id: number
  brawler_starpower_name: string
}

export default class StarpowerMetaCube extends BrawlerBattleCube<StarpowerMetaCubeRow> {
  table = 'brawltime.starpower_meta'
  engineDefinition = stripIndent`
    ENGINE = SummingMergeTree()
    PARTITION BY trophy_season_end
    PRIMARY KEY (brawler_trophyrange)
    ORDER BY (brawler_trophyrange, brawler_id, brawler_name, brawler_starpower_id, brawler_starpower_name)
  `

  dimensions = [
    'trophy_season_end',
    'brawler_trophyrange',
    'brawler_id',
    'brawler_name',
    'brawler_starpower_id',
    'brawler_starpower_name',
  ]
  dimensionsDefinition = stripIndent`
    trophy_season_end DateTime,
    brawler_trophyrange UInt8,
    brawler_id UInt32,
    brawler_name LowCardinality(String),
    brawler_starpower_id UInt32,
    brawler_starpower_name LowCardinality(String)
  `

  seedQuery = stripIndent`
    SELECT
      trophy_season_end,
      brawler_trophyrange,
      brawler_id,
      brawler_name,
      brawler_starpower_id,
      brawler_starpower_name,
      ${this.measuresQuery}
    FROM brawltime.battle
    WHERE brawler_starpowers_length <= 1
    GROUP BY ${this.dimensions.join(', ')}
  `

  mappers = {
    ...BrawlerBattleCube.mappers,
    brawler_id: 'int',
    brawler_starpower_id: 'int',
    brawler_starpower_name: 'string',
  } as Record<string, DataType>
}
