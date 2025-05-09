-- migrate:up
CREATE TABLE brawltime.survey_vote
(
    `timestamp` DateTime CODEC(LZ4HC(0)),
    `fingerprint` String CODEC(LZ4HC(0)),
    `player_id` UInt64 CODEC(LZ4HC(0)),
    `player_tag` String CODEC(LZ4HC(0)),

    `mode` LowCardinality(String) CODEC(LZ4HC(0)),
    `brawler_best` LowCardinality(String) CODEC(LZ4HC(0)),
    `brawler_rest` Array(LowCardinality(String)) CODEC(LZ4HC(0)),

    `player_trophies` UInt32 CODEC(LZ4HC(0)),
    `player_brawlers.brawler_name` Array(LowCardinality(String)) CODEC(LZ4HC(0)),
    `player_brawlers.brawler_power` Array(UInt8) CODEC(LZ4HC(0)),
    `player_brawlers.brawler_trophies` Array(UInt16) CODEC(LZ4HC(0))
)
ENGINE = MergeTree
PARTITION BY toStartOfWeek(timestamp)
ORDER BY (mode, timestamp);

-- migrate:down
DROP TABLE brawltime.survey_vote;
