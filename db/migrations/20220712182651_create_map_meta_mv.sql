-- migrate:up
CREATE MATERIALIZED VIEW brawltime.map_meta_mv TO brawltime.map_meta
(
    `trophy_season_end` DateTime,
    `brawler_trophyrange` UInt8,
    `brawler_name` String,
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
) AS
SELECT
    trophy_season_end,
    brawler_trophyrange,
    arrayJoin(arrayConcat(battle_allies.brawler_name, [brawler_name])) AS brawler_name,
    battle_event_mode,
    battle_event_map,
    battle_event_id,
    battle_event_powerplay,
    assumeNotNull(battle_is_bigbrawler) AS battle_is_bigbrawler,
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
GROUP BY
    trophy_season_end,
    brawler_trophyrange,
    brawler_name,
    battle_event_mode,
    battle_event_map,
    battle_event_id,
    battle_event_powerplay,
    battle_is_bigbrawler;


-- migrate:down
DROP MATERIALIZED VIEW brawltime.map_meta_mv;
