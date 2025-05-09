INSERT INTO brawltime.survey_vote
SELECT
    timestamp,
    fingerprint,
    arraySum(
        (c, i) ->
            (position('0289PYLQGRJCUV', c)-1)*pow(14, length(tag)-i-2),
        arraySlice(splitByString('', tag), 2),
        range(if(tag <> '', length(tag)-1, 0))
    ) AS player_id,
    tag AS player_tag,
    mode,
    best AS brawler_best,
    JSONExtract(rest, 'Array(String)') AS brawler_rest,
    player_trophies,
    JSONExtract(JSON_QUERY(player_brawler_trophies, '$[*].name'), 'Array(String)') AS `player_brawlers.brawler_name`,
    JSONExtract(JSON_QUERY(player_brawler_trophies, '$[*].power'), 'Array(UInt8)') AS `player_brawlers.brawler_power`,
    JSONExtract(JSON_QUERY(player_brawler_trophies, '$[*].trophies'), 'Array(UInt16)') AS `player_brawlers.brawler_trophies`
FROM mysql(
    'mysql:3306',
    'brawltime',
    'survey_vote',
    'brawltime',
    'brawltime'
)
-- skip until 3700 because they used a different schema
WHERE id BETWEEN 3700 AND 1000000 -- import in batches until 6000000
