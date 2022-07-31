-- migrate:up
CREATE MATERIALIZED VIEW brawltime.leaderboard_mv TO brawltime.leaderboard
(
    `player_id` UInt64,
    `timestamp` DateTime,
    `player_name` String,
    `player_icon_id` UInt32,
    `player_exp_points` UInt32,
    `player_3vs3_victories` UInt32,
    `player_solo_victories` UInt32,
    `player_duo_victories` UInt32
) AS
SELECT
    player_id,
    max(timestamp) AS timestamp,
    any(player_name) AS player_name,
    any(player_icon_id) AS player_icon_id,
    max(player_exp_points) AS player_exp_points,
    max(player_3vs3_victories) AS player_3vs3_victories,
    max(player_solo_victories) AS player_solo_victories,
    max(player_duo_victories) AS player_duo_victories
FROM brawltime.battle
GROUP BY player_id;


-- migrate:down
DROP MATERIALIZED VIEW brawltime.leaderboard_mv;
