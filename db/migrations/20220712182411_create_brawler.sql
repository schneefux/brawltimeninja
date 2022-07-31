-- migrate:up
CREATE TABLE brawltime.brawler
(
    `timestamp` Date CODEC(DoubleDelta, LZ4HC(0)),
    `trophy_season_end` Date CODEC(DoubleDelta, LZ4HC(0)),
    `player_id` UInt64 CODEC(Gorilla, LZ4HC(0)),
    `player_tag` String CODEC(LZ4HC(0)),
    `player_name` String CODEC(LZ4HC(0)),
    `player_name_color` FixedString(10) CODEC(LZ4HC(0)),
    `player_icon_id` UInt32 CODEC(Gorilla, LZ4HC(0)),
    `player_trophies` UInt32 CODEC(Gorilla, LZ4HC(0)),
    `player_highest_trophies` UInt32 CODEC(Gorilla, LZ4HC(0)),
    `player_power_play_points` UInt16 CODEC(Gorilla, LZ4HC(0)),
    `player_highest_power_play_points` UInt16 CODEC(Gorilla, LZ4HC(0)),
    `player_exp_points` UInt32 CODEC(Gorilla, LZ4HC(0)),
    `player_is_qualified_from_championship_challenge` UInt8 CODEC(Gorilla, LZ4HC(0)),
    `player_3vs3_victories` UInt32 CODEC(Gorilla, LZ4HC(0)),
    `player_solo_victories` UInt32 CODEC(Gorilla, LZ4HC(0)),
    `player_duo_victories` UInt32 CODEC(Gorilla, LZ4HC(0)),
    `player_best_robo_rumble_time` UInt16 CODEC(Gorilla, LZ4HC(0)),
    `player_best_time_as_big_brawler` UInt16 CODEC(Gorilla, LZ4HC(0)),
    `player_brawlers_length` UInt8 CODEC(Gorilla, LZ4HC(0)),
    `player_club_id` UInt64 CODEC(Gorilla, LZ4HC(0)),
    `player_club_tag` String CODEC(LZ4HC(0)),
    `player_club_name` String CODEC(LZ4HC(0)),
    `brawler_id` UInt32 CODEC(Gorilla, LZ4HC(0)),
    `brawler_name` LowCardinality(String) CODEC(LZ4HC(0)),
    `brawler_power` UInt8 CODEC(Gorilla, LZ4HC(0)),
    `brawler_trophies` UInt16 CODEC(DoubleDelta, LZ4HC(0)),
    `brawler_highest_trophies` UInt16 CODEC(DoubleDelta, LZ4HC(0)),
    `brawler_trophyrange` UInt8 CODEC(Gorilla, LZ4HC(0)),
    `brawler_starpowers.id` Array(UInt32) CODEC(LZ4HC(0)),
    `brawler_starpowers.name` Array(LowCardinality(String)) CODEC(LZ4HC(0)),
    `brawler_starpowers_length` UInt16 CODEC(Gorilla, LZ4HC(0)),
    `brawler_gadgets.id` Array(UInt32) CODEC(LZ4HC(0)),
    `brawler_gadgets.name` Array(LowCardinality(String)) CODEC(LZ4HC(0)),
    `brawler_gadgets_length` UInt16 CODEC(Gorilla, LZ4HC(0)),
    `brawler_gears.id` Array(UInt32) CODEC(LZ4HC(0)),
    `brawler_gears.name` Array(LowCardinality(String)) CODEC(LZ4HC(0)),
    `brawler_gears.level` Array(UInt8) CODEC(LZ4HC(0)),
    `brawler_gears_length` UInt16 CODEC(Gorilla, LZ4HC(0))
)
ENGINE = ReplacingMergeTree(timestamp)
PARTITION BY trophy_season_end
PRIMARY KEY player_id
ORDER BY (player_id, brawler_id, timestamp)
SAMPLE BY player_id
SETTINGS index_granularity = 1024;


-- migrate:down
DROP TABLE brawltime.brawler;
