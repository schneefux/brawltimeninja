-- migrate:up
CREATE MATERIALIZED VIEW brawltime.starpower_meta_mv TO brawltime.starpower_meta
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
) AS
SELECT
    trophy_season_end,
    brawler_trophyrange,
    brawler_id,
    brawler_name,
    brawler_starpower_id,
    brawler_starpower_name,
    argMaxState(timestamp, timestamp) AS timestamp_state,
    count(*) AS picks,
    sum(player_brawlers_length) AS picks_weighted,
    avgState(battle_duration) AS battle_duration_state,
    avgState(battle_rank) AS battle_rank_state,
    avgState(brawltime.battle.battle_rank = 1) AS battle_rank1_state,
    avgState(battle_victory) AS battle_victory_state,
    avgState(brawler_name = battle_starplayer_brawler_name) AS battle_starplayer_state,
    avgState(battle_level_id) AS battle_level_state,
    avgState(battle_trophy_change) AS battle_trophy_change_state
FROM brawltime.battle
WHERE brawler_starpowers_length <= 1
GROUP BY
    trophy_season_end,
    brawler_trophyrange,
    brawler_id,
    brawler_name,
    brawler_starpower_id,
    brawler_starpower_name;


-- migrate:down
DROP MATERIALIZED VIEW brawltime.starpower_meta_mv;
