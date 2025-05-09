
--
-- Database schema
--

CREATE DATABASE IF NOT EXISTS default;

CREATE TABLE default.schema_migrations
(
    `version` String,
    `ts` DateTime DEFAULT now(),
    `applied` UInt8 DEFAULT 1
)
ENGINE = ReplacingMergeTree(ts)
PRIMARY KEY version
ORDER BY version
SETTINGS index_granularity = 8192;


--
-- Dbmate schema migrations
--

INSERT INTO schema_migrations (version) VALUES
    ('20220712182215'),
    ('20220712182238'),
    ('20220712182319'),
    ('20220712182338'),
    ('20220712182411'),
    ('20220712182430'),
    ('20220712182518'),
    ('20220712182602'),
    ('20220712182623'),
    ('20220712182650'),
    ('20220712182651'),
    ('20220712183013'),
    ('20220712183043'),
    ('20230205111417'),
    ('20230205111452'),
    ('20250509112303');
