create materialized view brawler_allies_mv
engine=SummingMergeTree()
partition by trophy_season_end
primary key (brawler_name, brawler_trophyrange)
order by (brawler_name, brawler_trophyrange, battle_event_mode, battle_event_map, battle_event_id, ally_brawler_name)
populate
as select
  trophy_season_end,
  brawler_name,
  brawler_trophyrange,
  battle_event_mode,
  battle_event_map,
  battle_event_id,
  battle_allies.brawler_name as ally_brawler_name
from brawltime.battle
where trophy_season_end >= '2022-02-19'
array join battle_allies
group by trophy_season_end, brawler_name, brawler_trophyrange, battle_event_mode, battle_event_map, battle_event_id, ally_brawler_name

create materialized view brawler_enemies_mv
engine=SummingMergeTree()
partition by trophy_season_end
primary key (brawler_name, brawler_trophyrange)
order by (brawler_name, brawler_trophyrange, battle_event_mode, battle_event_map, battle_event_id, enemy_brawler_name)
populate
as select
  trophy_season_end,
  brawler_name,
  brawler_trophyrange,
  battle_event_mode,
  battle_event_map,
  battle_event_id,
  battle_allies.brawler_name as enemy_brawler_name
from brawltime.battle
where trophy_season_end >= '2022-02-19'
array join battle_allies
group by trophy_season_end, brawler_name, brawler_trophyrange, battle_event_mode, battle_event_map, battle_event_id, enemy_brawler_name
