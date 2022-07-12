-- migrate:up
CREATE TABLE brawltime.leaderboard
(
    `player_id` UInt64,
    `timestamp` SimpleAggregateFunction(max, DateTime),
    `player_name` SimpleAggregateFunction(any, String),
    `player_icon_id` SimpleAggregateFunction(any, UInt32),
    `player_exp_points` SimpleAggregateFunction(max, UInt32),
    `player_3vs3_victories` SimpleAggregateFunction(max, UInt32),
    `player_solo_victories` SimpleAggregateFunction(max, UInt32),
    `player_duo_victories` SimpleAggregateFunction(max, UInt32)
)
ENGINE = AggregatingMergeTree
PARTITION BY tuple()
ORDER BY player_id
TTL timestamp + toIntervalMonth(1)
SETTINGS index_granularity = 8192;


-- migrate:down
DROP TABLE brawltime.leaderboard;
