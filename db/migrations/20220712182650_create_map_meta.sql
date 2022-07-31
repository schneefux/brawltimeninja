-- migrate:up
CREATE TABLE brawltime.map_meta
(
    `trophy_season_end` DateTime,
    `brawler_trophyrange` UInt8,
    `brawler_name` LowCardinality(String),
    `battle_event_mode` LowCardinality(String),
    `battle_event_map` LowCardinality(String),
    `battle_event_id` UInt32,
    `battle_event_powerplay` UInt8,
    `battle_is_bigbrawler` UInt8,
    `timestamp_state` AggregateFunction(argMax, DateTime, DateTime),
    `picks` UInt64,
    `picks_weighted` UInt64,
    `battle_duration_state` AggregateFunction(avg, Nullable(UInt16)),
    `battle_rank_state` AggregateFunction(avg, Nullable(UInt8)),
    `battle_rank1_state` AggregateFunction(avg, Nullable(UInt8)),
    `battle_victory_state` AggregateFunction(avg, Nullable(Decimal(9, 8))),
    `battle_starplayer_state` AggregateFunction(avg, UInt8),
    `battle_level_state` AggregateFunction(avg, Nullable(UInt16)),
    `battle_trophy_change_state` AggregateFunction(avg, Nullable(Int8))
)
ENGINE = SummingMergeTree
PARTITION BY trophy_season_end
PRIMARY KEY brawler_trophyrange
ORDER BY (brawler_trophyrange, battle_event_mode, battle_event_map, brawler_name, battle_event_id, battle_event_powerplay, battle_is_bigbrawler)
SETTINGS index_granularity = 8192;


-- migrate:down
DROP TABLE brawltime.map_meta;
