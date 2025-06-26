-- migrate:up
CREATE MATERIALIZED VIEW brawltime.top_teams_mv
TO brawltime.top_teams AS
SELECT
    trophy_season_end,
    brawler_trophyrange,
    battle_event_mode,
    battle_event_map,
    battle_event_id,
    battle_event_powerplay,
    approx_top_sumState(50, 200)(
        arraySort(arrayConcat(battle_allies.brawler_name, [brawler_name])),
        assumeNotNull(toUInt64(roundBankers(battle_victory)))
    ) AS top_teams_by_win,
    approx_top_sumState(50, 200)(
        arraySort(arrayConcat(battle_allies.brawler_name, [brawler_name])),
        toUInt64(1)
    ) AS top_teams_by_pick
FROM brawltime.battle
GROUP BY
    trophy_season_end,
    brawler_trophyrange,
    battle_event_mode,
    battle_event_map,
    battle_event_id,
    battle_event_powerplay;

-- migrate:down
DROP VIEW brawltime.top_teams_mv;
