-- migrate:up
CREATE TABLE brawltime.starpower_meta
(
    `trophy_season_end` DateTime,
    `brawler_trophyrange` UInt8,
    `brawler_id` UInt32,
    `brawler_name` LowCardinality(String),
    `brawler_starpower_id` UInt32,
    `brawler_starpower_name` LowCardinality(String),
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
ORDER BY (brawler_trophyrange, brawler_id, brawler_name, brawler_starpower_id, brawler_starpower_name)
SETTINGS index_granularity = 8192;


-- migrate:down
DROP TABLE brawltime.starpower_meta;
