-- migrate:up
CREATE MATERIALIZED VIEW brawltime.brawler_allies_mv
(
    `trophy_season_end` DateTime,
    `brawler_name` LowCardinality(String),
    `brawler_id` UInt32,
    `brawler_trophyrange` UInt8,
    `battle_event_mode` LowCardinality(String),
    `battle_event_map` LowCardinality(String),
    `battle_event_id` UInt32,
    `ally_brawler_name` LowCardinality(String),
    `ally_brawler_id` UInt32,
    `battle_victory` Nullable(Decimal(9, 4)),
    `picks` UInt64
)
ENGINE = SummingMergeTree
PARTITION BY trophy_season_end
PRIMARY KEY (brawler_name, brawler_id, brawler_trophyrange)
ORDER BY (brawler_name, brawler_id, brawler_trophyrange, battle_event_mode, battle_event_map, battle_event_id, ally_brawler_name, ally_brawler_id)
SETTINGS index_granularity = 8192 AS
SELECT
    trophy_season_end,
    brawler_name,
    brawler_id,
    brawler_trophyrange,
    battle_event_mode,
    battle_event_map,
    battle_event_id,
    battle_allies.brawler_name AS ally_brawler_name,
    battle_allies.brawler_id AS ally_brawler_id,
    toDecimal32(sum(battle_victory), 4) AS battle_victory,
    count() AS picks
FROM brawltime.battle
ARRAY JOIN battle_allies
GROUP BY
    trophy_season_end,
    brawler_name,
    brawler_id,
    brawler_trophyrange,
    battle_event_mode,
    battle_event_map,
    battle_event_id,
    ally_brawler_name,
    ally_brawler_id;


-- migrate:down
DROP MATERIALIZED VIEW brawltime.brawler_allies_mv;
