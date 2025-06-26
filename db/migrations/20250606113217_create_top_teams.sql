-- migrate:up
CREATE TABLE brawltime.top_teams
(
    `trophy_season_end` DateTime,
    `brawler_trophyrange` UInt8,
    `battle_event_mode` LowCardinality(String),
    `battle_event_map` LowCardinality(String),
    `battle_event_id` UInt32,
    `battle_event_powerplay` UInt8,
    `top_teams_by_win`  AggregateFunction(approx_top_sum(50, 200), Array(LowCardinality(String)), UInt64),
    `top_teams_by_pick` AggregateFunction(approx_top_sum(50, 200), Array(LowCardinality(String)), UInt64)
)
ENGINE = AggregatingMergeTree
PRIMARY KEY (trophy_season_end)
ORDER BY (trophy_season_end, brawler_trophyrange, battle_event_mode, battle_event_map, battle_event_id, battle_event_powerplay);

-- migrate:down
DROP TABLE brawltime.top_teams;
