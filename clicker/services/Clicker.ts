import ClickHouse from '@apla/clickhouse';
import StatsD from 'hot-shots'
import { Player, BattleLog, BattlePlayer } from '~/model/Brawlstars';
import { performance } from 'perf_hooks';
import { BrawlerMetaRow, StarpowerMetaRow, GadgetMetaRow, ModeMetaRow, MapMetaRow, PlayerMetaRow, PlayerModeMetaRow, PlayerBrawlerMetaRow, BattleMeasures, LeaderboardRow, BrawlerLeaderboardRow, PlayerWinRatesRows, BrawlerStatisticsRows, TrophyRow, TrophiesRow, PlayerHistoryRows, BrawlerTrophiesRow } from '~/model/Clicker';
import { brawlerId } from '../lib/util';

const dbHost = process.env.CLICKHOUSE_HOST || ''
const stats = new StatsD({ prefix: 'brawltime.clicker.' })
const balanceChangesDate = new Date(Date.parse(process.env.BALANCE_CHANGES_DATE || '2020-07-01'))
const seasonSliceStart = getSeasonEnd(balanceChangesDate);

console.log(`querying data >= ${seasonSliceStart}`)

/*
  in SQL:
    date_add(from_days(ceil(to_days(date_sub(date_sub(timestamp, interval 8 hour), interval 1 day)) / 14) * 14 + 2), interval 8 hour)
  in clickhouse SQL:
    addHours(addDays(toStartOfInterval(subtractDays(subtractHours(timestamp, 8), 4), interval 336 hour, 'UTC'), 14+4), 8)
*/
/**
 * Round timestamp up to next trophy season interval.
 * @param timestamp
 */
function getSeasonEnd(timestamp: Date) {
  const trophySeasonEnd = new Date(Date.parse('2020-07-13T08:00:00Z'))
  const diff = timestamp.getTime() - trophySeasonEnd.getTime()
  const seasonsSince = Math.ceil(diff/1000/60/60/24/7/2)
  trophySeasonEnd.setUTCDate(trophySeasonEnd.getUTCDate() + seasonsSince*7*2)
  return trophySeasonEnd
}

/**
 * Get WHERE condition to filter for the current season.
 */
function sliceSeason() {
  const seasonEndFormatted = seasonSliceStart.toISOString()
    .slice(0, 19) // remove fractions and time zone
    .replace('T', ' ')
  return `trophy_season_end>=toDateTime('${seasonEndFormatted}', 'UTC')`
}

function sloppyParseFloat(number: string) {
  return Math.floor(parseFloat(number) * 10000) / 10000
}

/**
 * Throw if a tag is invalid.
 * Make sure tag starts with a hash.
 */
function validateTag(tag: string) {
  if (! /^#?[0289PYLQGRJCUV]{3,}$/.test(tag)) {
    throw new Error('Invalid tag ' + tag)
  }
  if (!tag.startsWith('#')) {
    return '#' + tag
  }
  return tag
}

// in clickhouse SQL (tag has to start with '#'):
/*
arraySum((c, i) -> (position('0289PYLQGRJCUV', c)-1)*pow(14, length(player_club_tag)-i-1-1), arraySlice(splitByString('', player_club_tag), 2), range(if(player_club_tag <> '', toUInt64(length(player_club_tag)-1), 0))) as player_club_id,
*/

/**
 * Encode tag string into 64bit unsigned integer string.
 */
function tagToId(tag: string) {
  if (! /^#?[0289PYLQGRJCUV]{3,}$/.test(tag)) {
    throw new Error('Cannot encode tag ' + tag)
  }
  if (tag.startsWith('#')) {
    tag = tag.substring(1)
  }

  const result = tag.split('').reduce((sum, c) => sum*BigInt(14) + BigInt('0289PYLQGRJCUV'.indexOf(c)), BigInt(0))
  return result.toString()
}

/**
 * Decode 64bit unsigned integer string into tag string with hash.
 */
function idToTag(idString: string) {
  let id = BigInt(idString)

  let tag = ''
  while (id != BigInt(0)) {
    const i = Number(id % BigInt(14))
    tag = '0289PYLQGRJCUV'[i] + tag
    id /= BigInt(14)
  }

  return '#' + tag
}

// shared definitions for meta measures
//
// battle
//
const battleMeasuresDefinition = `
  timestamp_state AggregateFunction(argMax, DateTime, DateTime),
  picks UInt64,
  picks_weighted UInt64,
  battle_duration_state AggregateFunction(avg, UInt16),
  battle_rank_state AggregateFunction(avg, UInt8),
  battle_rank1_state AggregateFunction(avg, UInt8),
  battle_victory_state AggregateFunction(avg, Decimal32(8)),
  battle_starplayer_state AggregateFunction(avg, UInt8),
  battle_level_state AggregateFunction(avg, UInt16),
  battle_trophy_change_state AggregateFunction(avg, Int8)
`

const battleMeasuresQuery = `
  argMaxState(timestamp, timestamp) as timestamp_state,
  COUNT(*) AS picks,
  SUM(player_brawlers_length) AS picks_weighted,
  avgState(battle_duration) AS battle_duration_state,
  avgState(battle_rank) AS battle_rank_state,
  avgState(brawltime.battle.battle_rank=1) AS battle_rank1_state,
  avgState(battle_victory) AS battle_victory_state,
  avgState(brawler_name=battle_starplayer_brawler_name) AS battle_starplayer_state,
  avgState(battle_level_id) AS battle_level_state,
  avgState(battle_trophy_change) as battle_trophy_change_state
`

const battleMeasuresAggregation = `
  argMaxMerge(timestamp_state) as timestamp,
  SUM(picks) AS picks,
  SUM(picks_weighted) AS picksWeighted,
  avgMerge(battle_rank_state) AS rank,
  avgMerge(battle_rank1_state) AS rank1Rate,
  avgMerge(battle_victory_state) AS winRate,
  avgMerge(battle_duration_state) AS duration,
  avgMerge(battle_starplayer_state) AS starRate,
  avgMerge(battle_level_state) AS level,
  avgMerge(battle_trophy_change_state) AS trophyChange
`

// ! starplayer applies only to player
const battleMeasuresAggregationRaw = `
  MAX(timestamp) as timestamp,
  COUNT(*) AS picks,
  SUM(player_brawlers_length) AS picksWeighted,
  AVG(battle_rank) AS rank,
  AVG(battle_rank=1) AS rank1Rate,
  AVG(battle_victory) AS winRate,
  AVG(battle_duration) AS duration,
  AVG(battle_is_starplayer) AS starRate,
  AVG(battle_level_id) AS level,
  AVG(battle_trophy_change) AS trophyChange
`

interface BattleMeasuresAggregation {
  timestamp: string
  picks: string
  picksWeighted: string
  rank: string
  rank1Rate: string
  winRate: string
  duration: string
  starRate: string
  level: string
  trophyChange: string
}

const parseBattleMeasures = (row: BattleMeasuresAggregation) => ({
  timestamp: row.timestamp,
  picks: parseInt(row.picks),
  picksWeighted: parseInt(row.picksWeighted),
  rank: sloppyParseFloat(row.rank),
  rank1Rate: sloppyParseFloat(row.rank1Rate),
  winRate: sloppyParseFloat(row.winRate),
  duration: sloppyParseFloat(row.duration),
  starRate: sloppyParseFloat(row.starRate),
  level: sloppyParseFloat(row.level),
  trophyChange: sloppyParseFloat(row.trophyChange),
}) as BattleMeasures

//
// player
//
const playerDimensionsDefinition = (dateType: string) => `
  timestamp_state AggregateFunction(argMax, ${dateType}, ${dateType}),
  player_name_state AggregateFunction(argMax, String, ${dateType})
`
const playerMeasuresDefinition = `
  ${playerDimensionsDefinition('DateTime')},
  player_exp_points_state AggregateFunction(argMax, UInt32, DateTime),
  player_trophies_state AggregateFunction(argMax, UInt32, DateTime),
  player_power_play_points_state AggregateFunction(argMax, UInt16, DateTime),
  player_3vs3_victories_state AggregateFunction(argMax, UInt32, DateTime),
  player_solo_victories_state AggregateFunction(argMax, UInt32, DateTime),
  player_duo_victories_state AggregateFunction(argMax, UInt32, DateTime)
`

const playerDimensionsQuery = `
  argMaxState(timestamp, timestamp) as timestamp_state,
  argMaxState(player_name, timestamp) as player_name_state
`
const playerMeasuresQuery = `
  ${playerDimensionsQuery},
  argMaxState(player_exp_points, timestamp) as player_exp_points_state,
  argMaxState(player_trophies, timestamp) as player_trophies_state,
  argMaxState(player_power_play_points, timestamp) as player_power_play_points_state,
  argMaxState(player_3vs3_victories, timestamp) as player_3vs3_victories_state,
  argMaxState(player_solo_victories, timestamp) as player_solo_victories_state,
  argMaxState(player_duo_victories, timestamp) as player_duo_victories_state
`

const playerDimensionsAggregation = `
  argMaxMerge(timestamp_state) as timestamp,
  argMaxMerge(player_name_state) as name
`
const playerMeasuresAggregation = `
  ${playerDimensionsAggregation},
  argMaxMerge(player_exp_points_state) as expPoints,
  argMaxMerge(player_trophies_state) as trophies,
  argMaxMerge(player_power_play_points_state) as powerPlayPoints,
  argMaxMerge(player_3vs3_victories_state) as victories,
  argMaxMerge(player_solo_victories_state) as soloVictories,
  argMaxMerge(player_duo_victories_state) as duoVictories
`

interface PLayerDimensionsAggregation {
  name: string
  timestamp: string
}

interface PlayerMeasuresAggregation extends PLayerDimensionsAggregation {
  expPoints: string
  trophies: string
  powerPlayPoints: string
  victories: string
  soloVictories: string
  duoVictories: string
}

const parsePlayerDimensions = (row: PLayerDimensionsAggregation) => ({
  name: row.name,
  timestamp: row.timestamp,
})
const parsePlayerMeasures = (row: PlayerMeasuresAggregation) => ({
  ...parsePlayerDimensions(row),
  expPoints: parseInt(row.expPoints),
  trophies: parseInt(row.trophies),
  powerPlayPoints: parseInt(row.powerPlayPoints),
  victories: parseInt(row.victories),
  soloVictories: parseInt(row.soloVictories),
  duoVictories: parseInt(row.duoVictories),
})

//
// player brawler
//
const brawlerMeasuresDefinition = `
  ${playerDimensionsDefinition('Date')},
  brawler_name_state AggregateFunction(argMax, String, Date),
  brawler_power_state AggregateFunction(argMax, UInt8, Date),
  brawler_trophies_state AggregateFunction(argMax, UInt16, Date),
  brawler_highest_trophies_state AggregateFunction(argMax, UInt16, Date)
`

const brawlerMeasuresQuery = `
  ${playerDimensionsQuery},
  argMaxState(brawler_name, timestamp) as brawler_name_state,
  argMaxState(brawler_power, timestamp) as brawler_power_state,
  argMaxState(brawler_trophies, timestamp) as brawler_trophies_state,
  argMaxState(brawler_highest_trophies, timestamp) as brawler_highest_trophies_state
`

const brawlerMeasuresAggregation = `
  ${playerDimensionsAggregation},
  argMaxMerge(brawler_name_state) as brawlerName,
  argMaxMerge(brawler_power_state) as power,
  argMaxMerge(brawler_trophies_state) as trophies,
  argMaxMerge(brawler_highest_trophies_state) as highestTrophies
`

interface BrawlerMeasuresAggregation extends PLayerDimensionsAggregation {
  brawlerName: string
  power: string
  trophies: string
  highestTrophies: string
}

const parseBrawlerMeasures = (row: BrawlerMeasuresAggregation) => ({
  ...parsePlayerDimensions(row),
  brawlerName: row.brawlerName,
  power: parseInt(row.power),
  trophies: parseInt(row.trophies),
  highestTrophies: parseInt(row.highestTrophies),
})


export default class ClickerService {
  private ch: ClickHouse;

  constructor() {
    this.ch = new ClickHouse(dbHost);
  }

  private async query<T>(query: string, metricName: string, readonly=true): Promise<T[]> {
    stats.increment(metricName + '.run')
    return stats.asyncTimer(() =>
      this.ch.querying(query, { dataObjects: true, readonly })
        .then(response => response.data as T[])
    , metricName + '.timer')()
  }

  public async migrate() {
    await this.ch.querying('CREATE DATABASE IF NOT EXISTS brawltime')

    const playerColumns = `
      -- player
      player_id UInt64 Codec(Gorilla, LZ4HC),
      player_tag String Codec(LZ4HC),
      player_name String Codec(LZ4HC),
      player_name_color FixedString(10) Codec(LZ4HC), -- 0x + 8 hex chars
      player_icon_id UInt32 Codec(Gorilla, LZ4HC),
      player_trophies UInt32 Codec(Gorilla, LZ4HC),
      player_highest_trophies UInt32 Codec(Gorilla, LZ4HC),
      player_power_play_points UInt16 Codec(Gorilla, LZ4HC),
      player_highest_power_play_points UInt16 Codec(Gorilla, LZ4HC),
      player_exp_points UInt32 Codec(Gorilla, LZ4HC),
      player_is_qualified_from_championship_challenge UInt8 Codec(Gorilla, LZ4HC),
      player_3vs3_victories UInt32 Codec(Gorilla, LZ4HC),
      player_solo_victories UInt32 Codec(Gorilla, LZ4HC),
      player_duo_victories UInt32 Codec(Gorilla, LZ4HC),
      player_best_robo_rumble_time UInt16 Codec(Gorilla, LZ4HC),
      player_best_time_as_big_brawler UInt16 Codec(Gorilla, LZ4HC),
      -- calculated
      player_brawlers_length UInt8 Codec(Gorilla, LZ4HC),
      -- player club
      player_club_id UInt64 Codec(Gorilla, LZ4HC),
      player_club_tag String Codec(LZ4HC),
      player_club_name String Codec(LZ4HC)
    `

    const brawlerColumns = `
      -- brawler
      brawler_id UInt32 Codec(Gorilla, LZ4HC),
      brawler_name LowCardinality(String) Codec(LZ4HC),
      brawler_power UInt8 Codec(Gorilla, LZ4HC),
      brawler_trophies UInt16 Codec(DoubleDelta, LZ4HC), -- trophy change is mostly constant
      brawler_highest_trophies UInt16 Codec(DoubleDelta, LZ4HC),
      -- calculated
      brawler_trophyrange UInt8 Codec(Gorilla, LZ4HC),
      -- starpowers (nested)
      \`brawler_starpowers.id\` Array(UInt32) Codec(LZ4HC),
      \`brawler_starpowers.name\` Array(LowCardinality(String)) Codec(LZ4HC),
      brawler_starpowers_length UInt16 Codec(Gorilla, LZ4HC),
      -- gadgets (nested)
      \`brawler_gadgets.id\` Array(UInt32) Codec(LZ4HC),
      \`brawler_gadgets.name\` Array(LowCardinality(String)) Codec(LZ4HC),
      brawler_gadgets_length UInt16 Codec(Gorilla, LZ4HC)
    `

    //
    // battle table
    //
    // TODO on next table rewrite, use ReplacingMergeTree
    await this.ch.querying(`
      CREATE TABLE IF NOT EXISTS brawltime.battle (
        timestamp DateTime Codec(DoubleDelta, LZ4HC),
        -- calculated
        trophy_season_end DateTime Codec(DoubleDelta, LZ4HC),
        ${playerColumns},
        -- player brawler
        -- see other table
        ${brawlerColumns},
        -- brawler active starpower
        brawler_starpower_found UInt8 Codec(Gorilla, LZ4HC),
        brawler_starpower_id UInt32 Codec(LZ4HC),
        brawler_starpower_name LowCardinality(String) Codec(LZ4HC),
        -- brawler active gadget
        brawler_gadget_found UInt8 Codec(Gorilla, LZ4HC),
        brawler_gadget_id UInt32 Codec(LZ4HC),
        brawler_gadget_name LowCardinality(String) Codec(LZ4HC),
        -- battle event
        battle_event_id UInt32 Codec(Gorilla, LZ4HC),
        battle_event_mode LowCardinality(String) Codec(LZ4HC),
        battle_event_map LowCardinality(String) Codec(LZ4HC),
        -- battle
        -- mode: ommitted because duplicate
        battle_type LowCardinality(String) Codec(LZ4HC),
        battle_result LowCardinality(String) Codec(LZ4HC),
        -- Nullable + Encoding is not supported
        battle_duration Nullable(UInt16) Codec(LZ4HC),
        battle_rank Nullable(UInt8) Codec(LZ4HC),
        battle_trophy_change Nullable(Int8) Codec(LZ4HC),
        battle_level_name LowCardinality(String) Codec(LZ4HC),
        battle_level_id Nullable(UInt16) Codec(LZ4HC),
        -- calculated
        battle_victory Nullable(Decimal32(8)) Codec(LZ4HC),
        -- battle starplayer
        battle_starplayer_brawler_id UInt32 Codec(LZ4HC),
        battle_starplayer_brawler_name LowCardinality(String) Codec(LZ4HC),
        battle_starplayer_brawler_power UInt8 Codec(Gorilla, LZ4HC),
        battle_starplayer_brawler_trophies UInt16 Codec(Gorilla, LZ4HC),
        -- calculated
        battle_is_starplayer Nullable(UInt8) Codec(LZ4HC),
        -- battle big brawler
        battle_bigbrawler_brawler_id UInt32 Codec(LZ4HC),
        battle_bigbrawler_brawler_name LowCardinality(String) Codec(LZ4HC),
        battle_bigbrawler_brawler_power UInt8 Codec(Gorilla, LZ4HC),
        battle_bigbrawler_brawler_trophies UInt16 Codec(Gorilla, LZ4HC),
        -- calculated
        battle_is_bigbrawler Nullable(UInt8) Codec(LZ4HC),
        -- battle allies and enemies (nested)
        -- player names and tags ommitted, not needed
        \`battle_allies.brawler_id\` Array(UInt32) Codec(LZ4HC),
        \`battle_allies.brawler_name\` Array(LowCardinality(String)) Codec(LZ4HC),
        \`battle_allies.brawler_power\` Array(UInt8) Codec(LZ4HC),
        \`battle_allies.brawler_trophies\` Array(UInt16) Codec(LZ4HC),
        \`battle_enemies.brawler_id\` Array(UInt32) Codec(LZ4HC),
        \`battle_enemies.brawler_name\` Array(LowCardinality(String)) Codec(LZ4HC),
        \`battle_enemies.brawler_power\` Array(UInt8) Codec(LZ4HC),
        \`battle_enemies.brawler_trophies\` Array(UInt16) Codec(LZ4HC)
      )
      ENGINE = MergeTree()
      -- there are no unique checks!
      -- memory consumption for the index is partition cardinality * pk size * pk cardinality / index granularity
      PRIMARY KEY (player_id)
      ORDER BY (player_id, timestamp)
      PARTITION BY trophy_season_end
      SAMPLE BY (player_id)
      -- TTL timestamp + INTERVAL 1 MONTH DELETE
      -- 25 battles per battle log query
      SETTINGS index_granularity=25;
    `)

    //
    // player brawler table
    //
    await this.ch.querying(`
      CREATE TABLE IF NOT EXISTS brawltime.brawler (
        -- day without time = 1 record/day
        timestamp Date Codec(DoubleDelta, LZ4HC),
        -- calculated
        trophy_season_end Date Codec(DoubleDelta, LZ4HC),
        ${playerColumns},
        ${brawlerColumns}
      )
      -- will keep latest version by sorting key
      -- syncs in background so duplicates are possible
      ENGINE = ReplacingMergeTree(timestamp)
      PRIMARY KEY (player_id)
      ORDER BY (player_id, brawler_id, timestamp)
      PARTITION BY trophy_season_end
      SAMPLE BY (player_id)
      -- TTL timestamp + INTERVAL 6 MONTH DELETE
      -- ca. 30 brawlers per player, 30 days
      SETTINGS index_granularity=1024;
    `)

    //
    // map meta
    //
    // *state must have same data type as source column
    await this.ch.querying(`
      CREATE TABLE IF NOT EXISTS brawltime.map_meta (
        trophy_season_end DateTime,
        brawler_trophyrange UInt8,
        brawler_name LowCardinality(String),
        battle_event_mode LowCardinality(String),
        battle_event_map LowCardinality(String),
        battle_event_id UInt32,
        battle_is_bigbrawler UInt8,
        ${battleMeasuresDefinition}
      )
      ENGINE = SummingMergeTree()
      PARTITION BY trophy_season_end
      PRIMARY KEY (brawler_trophyrange)
      ORDER BY (brawler_trophyrange, battle_event_mode, battle_event_map, brawler_name, battle_event_id, battle_is_bigbrawler)
    `)

    const mapMetaQuery = `
      SELECT
        trophy_season_end,
        brawler_trophyrange,
        arrayJoin(arrayConcat(battle_allies.brawler_name, [brawler_name])) AS brawler_name,
        battle_event_mode,
        battle_event_map,
        battle_event_id,
        assumeNotNull(battle_is_bigbrawler) AS battle_is_bigbrawler,
        ${battleMeasuresQuery}
      FROM brawltime.battle
      GROUP BY trophy_season_end, brawler_trophyrange, brawler_name, battle_event_mode, battle_event_map, battle_event_id, battle_is_bigbrawler
      ORDER BY trophy_season_end, brawler_trophyrange, brawler_name, battle_event_mode, battle_event_map, battle_event_id, battle_is_bigbrawler
    `
    // mv column names must match table column names
    // errors are thrown on INSERT!
    // query from table (not from view) or decimals are messed up (?)
    await this.ch.querying(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS brawltime.map_meta_mv
      TO brawltime.map_meta
      AS ${mapMetaQuery}
    `)
    const mapMetaCount = await this.ch.querying('SELECT COUNT() AS c FROM brawltime.map_meta', { dataObjects: true })
    if (mapMetaCount.data[0].c == 0) {
      console.log('populating map meta')
      await this.ch.querying(`INSERT INTO brawltime.map_meta ${mapMetaQuery}`)
    }

    //
    // gadget meta
    //
    await this.ch.querying(`
      CREATE TABLE IF NOT EXISTS brawltime.gadget_meta (
        trophy_season_end DateTime,
        brawler_trophyrange UInt8,
        brawler_id UInt32,
        brawler_name LowCardinality(String),
        brawler_gadget_id UInt32,
        brawler_gadget_name LowCardinality(String),
        ${battleMeasuresDefinition}
      )
      ENGINE = SummingMergeTree()
      PARTITION BY trophy_season_end
      PRIMARY KEY (brawler_trophyrange)
      ORDER BY (brawler_trophyrange, brawler_id, brawler_name, brawler_gadget_id, brawler_gadget_name)
    `)

    const gadgetMetaQuery = `
      SELECT
        trophy_season_end,
        brawler_trophyrange,
        brawler_id,
        brawler_name,
        brawler_gadget_id,
        brawler_gadget_name,
        ${battleMeasuresQuery}
      FROM brawltime.battle
      WHERE brawler_gadgets_length <= 1
      GROUP BY trophy_season_end, brawler_trophyrange, brawler_id, brawler_name, brawler_gadget_id, brawler_gadget_name
      ORDER BY trophy_season_end, brawler_trophyrange, brawler_id, brawler_name, brawler_gadget_id, brawler_gadget_name
    `
    await this.ch.querying(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS brawltime.gadget_meta_mv
      TO brawltime.gadget_meta
      AS ${gadgetMetaQuery}
    `)
    const gadgetMetaCount = await this.ch.querying('SELECT COUNT() AS c FROM brawltime.gadget_meta', { dataObjects: true })
    if (gadgetMetaCount.data[0].c == 0) {
      console.log('populating gadget meta')
      await this.ch.querying(`INSERT INTO brawltime.gadget_meta ${gadgetMetaQuery}`)
    }

    //
    // starpower meta
    //
    await this.ch.querying(`
      CREATE TABLE IF NOT EXISTS brawltime.starpower_meta (
        trophy_season_end DateTime,
        brawler_trophyrange UInt8,
        brawler_id UInt32,
        brawler_name LowCardinality(String),
        brawler_starpower_id UInt32,
        brawler_starpower_name LowCardinality(String),
        ${battleMeasuresDefinition}
      )
      ENGINE = SummingMergeTree()
      PARTITION BY trophy_season_end
      PRIMARY KEY (brawler_trophyrange)
      ORDER BY (brawler_trophyrange, brawler_id, brawler_name, brawler_starpower_id, brawler_starpower_name)
    `)

    const starpowerMetaQuery = `
      SELECT
        trophy_season_end,
        brawler_trophyrange,
        brawler_id,
        brawler_name,
        brawler_starpower_id,
        brawler_starpower_name,
        ${battleMeasuresQuery}
      FROM brawltime.battle
      WHERE brawler_starpowers_length <= 1
      GROUP BY trophy_season_end, brawler_trophyrange, brawler_id, brawler_name, brawler_starpower_id, brawler_starpower_name
      ORDER BY trophy_season_end, brawler_trophyrange, brawler_id, brawler_name, brawler_starpower_id, brawler_starpower_name
    `
    await this.ch.querying(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS brawltime.starpower_meta_mv
      TO brawltime.starpower_meta
      AS ${starpowerMetaQuery}
    `)
    const starpowerMetaCount = await this.ch.querying('SELECT COUNT() AS c FROM brawltime.starpower_meta', { dataObjects: true })
    if (starpowerMetaCount.data[0].c == 0) {
      console.log('populating starpower meta')
      await this.ch.querying(`INSERT INTO brawltime.starpower_meta ${starpowerMetaQuery}`)
    }

    //
    // player leaderboard
    //
    // TODO: add a TTL and compression
    await this.ch.querying(`
      CREATE TABLE IF NOT EXISTS brawltime.leaderboard (
        player_id UInt64,
        ${playerMeasuresDefinition}
      )
      ENGINE = AggregatingMergeTree()
      PARTITION BY tuple()
      ORDER BY (player_id)
    `)

    const leaderboardQuery = `
      SELECT
        player_id,
        ${playerMeasuresQuery}
      FROM brawltime.battle
      GROUP BY player_id
    `
    await this.ch.querying(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS brawltime.leaderboard_mv
      TO brawltime.leaderboard
      AS ${leaderboardQuery}
    `)
    const leaderboardCount = await this.ch.querying('SELECT COUNT() AS c FROM brawltime.leaderboard', { dataObjects: true })
    if (leaderboardCount.data[0].c == 0) {
      console.log('populating leaderboard')
      await this.ch.querying(`INSERT INTO brawltime.leaderboard ${leaderboardQuery}`)
    }

    //
    // player brawler leaderboard
    //
    // TODO: add a TTL
    await this.ch.querying(`
      CREATE TABLE IF NOT EXISTS brawltime.brawler_leaderboard (
        player_id UInt64,
        brawler_id UInt32,
        ${brawlerMeasuresDefinition}
      )
      ENGINE = AggregatingMergeTree()
      PARTITION BY tuple()
      ORDER BY (brawler_id, player_id)
    `)

    const brawlerLeaderboardQuery = `
      SELECT
        player_id,
        brawler_id,
        ${brawlerMeasuresQuery}
      FROM brawltime.brawler
      GROUP BY player_id, brawler_id
    `
    await this.ch.querying(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS brawltime.brawler_leaderboard_mv
      TO brawltime.brawler_leaderboard
      AS ${brawlerLeaderboardQuery}
    `)
    const brawlerLeaderboardCount = await this.ch.querying('SELECT COUNT() AS c FROM brawltime.brawler_leaderboard', { dataObjects: true })
    if (brawlerLeaderboardCount.data[0].c == 0) {
      console.log('populating brawler leaderboard')
      await this.ch.querying(`INSERT INTO brawltime.brawler_leaderboard ${brawlerLeaderboardQuery}`)
    }
  }

  public async store(entry: { player: Player, battleLog: BattleLog }) {
    const player = entry.player
    player.tag = validateTag(player.tag)

    /** Parse API time format */
    const parseTime = (time: string) => new Date(Date.parse(time))
    const parseApiTime = (time: string) => {
      return parseTime(`${time.slice(0, 4)}-${time.slice(4, 6)}-${time.slice(6, 8)}T${time.slice(9, 11)}:${time.slice(11, 13)}:${time.slice(13)}`)
    }

    // parse dates
    const battles = entry.battleLog.items.map(battle => ({
      ...battle,
      battleTime: parseApiTime(battle.battleTime),
    }))

    // TODO maybe put this into redis to avoid slow blocking point queries
    const maxTimestamp = await this.query<any>(
      `SELECT MAX(timestamp) AS maxTimestamp FROM brawltime.battle WHERE ${sliceSeason()} AND player_id=${tagToId(player.tag)}`,
      'player.get_last')
    // if not found, clickhouse max() defaults to 0000 date (Date.parse returns NaN)
    const lastBattleTimestamp = new Date(Date.parse(maxTimestamp[0].maxTimestamp) || seasonSliceStart)

    const battleInsertStart = performance.now()
    const battleStream = this.ch.query('INSERT INTO brawltime.battle', { format: 'JSONEachRow' }, (error) => {
      if (error) {
        stats.increment('player.insert.error')
        console.error(`error inserting battle for ${player.tag} (${tagToId(player.tag)}): ${error}`)
      } else {
        stats.timing('player.insert.timer', performance.now() - battleInsertStart)
      }
    })

    const playerFacts = {
      player_id: tagToId(player.tag),
      player_tag: player.tag,
      player_name: player.name,
      player_name_color: player.nameColor,
      player_icon_id: player.icon.id,
      player_trophies: player.trophies,
      player_highest_trophies: player.highestTrophies,
      player_power_play_points: player.powerPlayPoints,
      player_highest_power_play_points: player.highestPowerPlayPoints,
      player_exp_points: player.expPoints,
      player_is_qualified_from_championship_challenge: player.isQualifiedFromChampionshipChallenge,
      player_3vs3_victories: player['3vs3Victories'],
      player_solo_victories: player.soloVictories,
      player_duo_victories: player.duoVictories,
      player_best_robo_rumble_time: player.bestRoboRumbleTime,
      player_best_time_as_big_brawler: player.bestTimeAsBigBrawler,
      // calculated
      player_brawlers_length: player.brawlers.length,
      /* player club */
      player_club_id: player.club?.tag != undefined ? tagToId(player.club.tag) : undefined,
      player_club_tag: player.club?.tag,
      player_club_name: player.club?.name,
    }

    // insert records for meta stats
    for (const battle of battles) {
      stats.increment('player.insert.run')

      if (battle.battle.type == 'friendly') {
        // ignore
        // in friendlies, players can play brawlers without owning them -> myBrawler is undefined
        console.log(`ignoring friendly battle for ${player.tag} (${tagToId(player.tag)})`)
        return
      }

      if (battle.battleTime <= lastBattleTimestamp) {
        // duplicate
        console.log(`ignoring old battle (${battle.battleTime.toISOString()} <= ${lastBattleTimestamp.toISOString()}) for ${player.tag} (${tagToId(player.tag)})`)
        return
      }

      // FIXME API bug 2020-07-26
      if (battle.event.mode == 'roboRumble' && battle.battle.result == undefined) {
        // 'duration' is 1 (loss) or N/A (win)
        battle.battle.result = !('duration' in battle.battle) ? 'victory' : 'defeat'
        delete battle.battle.duration
      }

      const teamsWithoutBigBrawler = (battle.battle.teams !== undefined ? battle.battle.teams : battle.battle.players!.map((p) => [p]))
      const teams = battle.battle.bigBrawler !== undefined ? teamsWithoutBigBrawler.concat([[battle.battle.bigBrawler]]) : teamsWithoutBigBrawler

      const myTeamIndex = teams.findIndex(t => t.find(p => p.tag == player.tag))
      if (myTeamIndex == -1) {
        console.log(`ignoring bot battle for ${player.tag} (${tagToId(player.tag)})`)
        return // replaced by bot?
      }

      const myTeam = teams[myTeamIndex]
      const myIndex = myTeam.findIndex(p => p.tag == player.tag)
      const me = myTeam[myIndex]
      const myBrawler = player.brawlers.find((b) => b.name == me.brawler.name)!
      const myStarpower = myBrawler.starPowers.length != 1 ? null : myBrawler.starPowers[0]
      const myGadget = myBrawler.gadgets.length != 1 ? null : myBrawler.gadgets[0]
      const floatingVictory =
          battle.battle.result == 'victory' ? 1.0
        : battle.battle.result == 'defeat' ? 0.0
        : battle.battle.result == 'draw' ? 0.5
        : 'rank' in battle.battle ? 1 - (battle.battle.rank! - 1) / (teams.length - 1)
        : null

      const trophySeasonEnd = getSeasonEnd(battle.battleTime)
      const trophyRange = Math.floor(me.brawler.trophies / 100)

      const allies = myTeam.filter(p => p.tag !== player.tag)
      const enemies = (<BattlePlayer[]>[]).concat(...teams.filter(t => t !== myTeam))

      // TODO determine powerplay y/n
      const record = {
        timestamp: battle.battleTime,
        trophy_season_end: trophySeasonEnd,
        ...playerFacts,
        /* player brawler */
        // see other table
        /* brawler */
        brawler_id: myBrawler.id,
        brawler_name: myBrawler.name || 'NANI', // FIXME API bug 2020-06-06
        brawler_power: me.brawler.power,
        brawler_trophies: me.brawler.trophies,
        brawler_highest_trophies: myBrawler.highestTrophies,
        // calculated
        brawler_trophyrange: trophyRange,
        /* brawler starpower */
        brawler_starpower_found: myStarpower !== null,
        brawler_starpower_id: myStarpower?.id,
        brawler_starpower_name: myStarpower?.name,
        /* brawler gadget */
        brawler_gadget_found: myGadget !== null,
        brawler_gadget_id: myGadget?.id,
        brawler_gadget_name: myGadget?.name,
        /* starpowers (nested) */
        'brawler_starpowers.id': myBrawler?.starPowers.map(sp => sp.id),
        'brawler_starpowers.name': myBrawler?.starPowers.map(sp => sp.name),
        brawler_starpowers_length: myBrawler?.starPowers.length,
        /* gadgets (nested) */
        'brawler_gadgets.id': myBrawler?.gadgets.map(g => g.id),
        'brawler_gadgets.name': myBrawler?.gadgets.map(g => g.name),
        brawler_gadgets_length: myBrawler?.gadgets.length,
        /* battle event */
        battle_event_id: battle.event.id,
        battle_event_mode: battle.event.mode,
        battle_event_map: battle.event.map,
        /* battle */
        // mode: ommitted because duplicate
        battle_type: battle.battle.type,
        battle_result: battle.battle.result,
        battle_duration: battle.battle.duration,
        battle_rank: battle.battle.rank,
        battle_trophy_change: battle.battle.trophyChange,
        battle_level_name: battle.battle.level?.name,
        battle_level_id: 'level' in battle.battle ? battle.battle.level?.id : null,
        // calculated
        battle_victory: floatingVictory == null ? null : Math.floor(floatingVictory * 10e7) / 10e7, // Decimal(8)
        /* battle starplayer */
        battle_starplayer_brawler_id: battle.battle.starPlayer?.brawler.id,
        battle_starplayer_brawler_name: battle.battle.starPlayer?.brawler.name,
        battle_starplayer_brawler_power: battle.battle.starPlayer?.brawler.power,
        battle_starplayer_brawler_trophies: battle.battle.starPlayer?.brawler.trophies,
        // calculated
        battle_is_starplayer: 'starPlayer' in battle.battle ? battle.battle.starPlayer?.tag === player.tag : null,
        /* battle big brawler */
        battle_bigbrawler_brawler_id: battle.battle.bigBrawler?.brawler.id,
        battle_bigbrawler_brawler_name: battle.battle.bigBrawler?.brawler.name,
        battle_bigbrawler_brawler_power: battle.battle.bigBrawler?.brawler.power,
        battle_bigbrawler_brawler_trophies: battle.battle.bigBrawler?.brawler.trophies,
        // calculated
        battle_is_bigbrawler: 'bigBrawler' in battle.battle ? battle.battle.bigBrawler?.tag == player.tag : null,
        /* battle allies (nested) */
        'battle_allies.brawler_id': allies.map(a => a.brawler.id),
        'battle_allies.brawler_name': allies.map(a => a.brawler.name),
        'battle_allies.brawler_power': allies.map(a => a.brawler.power),
        'battle_allies.brawler_trophies': allies.map(a => a.brawler.trophies),
        /* battle enemies (nested) */
        'battle_enemies.brawler_id': enemies.map(e => e.brawler.id),
        'battle_enemies.brawler_name': enemies.map(e => e.brawler.name),
        'battle_enemies.brawler_power': enemies.map(e => e.brawler.power),
        'battle_enemies.brawler_trophies': enemies.map(e => e.brawler.trophies),
      }

      // to debug encoding errors:
      // console.log(require('@apla/clickhouse/src/process-db-value').encodeRow(record, (<any>stream).format))
      await new Promise((resolve, reject) => {
        if (battleStream.write(record)) {
          return resolve()
        }

        stats.increment('player.insert.buffering')
        battleStream.once('drain', (err) => {
          if (err) {
            stats.increment('player.insert.error')
            console.error(`error inserting battle for ${player.tag} (${tagToId(player.tag)})`, record, err)
            return reject(err)
          }

          return resolve()
        })
      })
    }

    battleStream.end()

    const brawlerInsertStart = performance.now()
    const brawlerStream = this.ch.query('INSERT INTO brawltime.brawler', { format: 'JSONEachRow' }, (error) => {
      if (error) {
        stats.increment('brawler.insert.error')
        console.error(`error inserting brawler for ${player.tag} (${tagToId(player.tag)}): ${error}`)
      } else {
        stats.timing('brawler.insert.timer', performance.now() - brawlerInsertStart)
      }
    })

    for (const brawler of player.brawlers) {
      stats.increment('brawler.insert.run')

      const record = {
        timestamp: new Date().toISOString().substring(0, 10),
        trophy_season_end: getSeasonEnd(new Date()).toISOString().substring(0, 10),
        ...playerFacts,
        brawler_id: brawler.id,
        brawler_name: brawler.name || 'NANI', // FIXME API bug 2020-06-06
        brawler_power: brawler.power,
        brawler_trophies: brawler.trophies,
        brawler_highest_trophies: brawler.highestTrophies,
        /* starpowers (nested) */
        'brawler_starpowers.id': brawler.starPowers.map(sp => sp.id),
        'brawler_starpowers.name': brawler.starPowers.map(sp => sp.name),
        brawler_starpowers_length: brawler.starPowers.length,
        /* gadgets (nested) */
        'brawler_gadgets.id': brawler.gadgets.map(g => g.id),
        'brawler_gadgets.name': brawler.gadgets.map(g => g.name),
        brawler_gadgets_length: brawler.gadgets.length,
      }

      await new Promise((resolve, reject) => {
        if (brawlerStream.write(record)) {
          return resolve()
        }

        stats.increment('brawler.insert.buffering')
        brawlerStream.once('drain', (err) => {
          if (err) {
            stats.increment('brawler.insert.error')
            console.error(`error inserting brawler for ${player.tag} (${tagToId(player.tag)})`, record, err)
            return reject(err)
          }

          return resolve()
        })
      })
    }

    brawlerStream.end()
  }

  public async getTopByMetric(metric: string, limit: number): Promise<LeaderboardRow[]> {
    const metrics = [
      'expPoints',
      'trophies',
      'powerPlayPoints',
      'victories',
      'soloVictories',
      'duoVictories',
    ]
    if (!metrics.includes(metric)) {
      console.error('invalid metric', metric)
      return []
    }

    interface LeaderboardQuery extends PlayerMeasuresAggregation {
      playerId: string
    }

    return await this.query<LeaderboardQuery>(`
      SELECT
        player_id AS playerId,
        ${playerMeasuresAggregation}
      FROM brawltime.leaderboard
      GROUP BY playerId
      HAVING timestamp > now() - interval 1 week
      ORDER BY ${metric} DESC
      LIMIT ${limit}
      `, 'leaderboard')
      .then(data => data.map(row => <LeaderboardRow>({
        ...parsePlayerMeasures(row),
        tag: idToTag(row.playerId).replace('#', ''),
      })))
  }

  public async getTopBrawlerByMetric(brawlerId: string, metric: string, limit: number): Promise<BrawlerLeaderboardRow[]> {
    const metrics = [
      'trophies',
      'highestTrophies',
    ]
    if (!metrics.includes(metric)) {
      console.error('invalid metric', metric)
      return []
    }

    if (isNaN(parseInt(brawlerId))) {
      console.error('invalid brawlerId', brawlerId)
      return []
    }

    interface LeaderboardQuery extends BrawlerMeasuresAggregation {
      playerId: string
      brawlerId: string
    }

    return await this.query<LeaderboardQuery>(`
      SELECT
        player_id AS playerId,
        ${brawlerMeasuresAggregation}
      FROM brawltime.brawler_leaderboard
      WHERE brawler_id=${brawlerId}
      GROUP BY playerId
      HAVING timestamp > now() - interval 1 week
      ORDER BY ${metric} DESC
      LIMIT ${limit}
      `, 'brawler_leaderboard')
      .then(data => data.map(row => <BrawlerLeaderboardRow>({
        ...parseBrawlerMeasures(row),
        tag: idToTag(row.playerId).replace('#', ''),
      })))
  }

  public async getHistory(tag: string): Promise<PlayerHistoryRows> {
    tag = validateTag(tag)

    // assumes sort by timestamp
    const differentFromDayBefore = (row: TrophiesRow, index: number, all: TrophiesRow[]) =>
      index == 0 || all[index - 1].trophies != row.trophies

    // database does not guarantee that there are no duplicates -> group by start of day
    interface PlayerHistoryQuery {
      timestamp: string
      trophies: string
    }
    const playerHistory = await this.query<PlayerHistoryQuery>(`
      SELECT
        toStartOfDay(timestamp) AS timestamp,
        player_trophies AS trophies
      FROM brawltime.brawler
      WHERE player_id=${tagToId(tag)}
      ORDER BY timestamp
      `, 'player.history')
      .then(data => data.map(row => ({
        ...row,
        timestamp: row.timestamp.slice(0, 10),
        trophies: parseInt(row.trophies),
      }) as TrophiesRow).filter(differentFromDayBefore))

    // assumes sort by id, then timestamp
    const differentFromDayBeforeBrawler = (row: BrawlerTrophiesRow, index: number, all: BrawlerTrophiesRow[]) =>
      index == 0 || all[index - 1].id != row.id || all[index - 1].trophies != row.trophies

    interface BrawlerHistoryQuery {
      id: string
      name: string
      timestamp: string
      trophies: string
    }
    const brawlerHistory = await this.query<BrawlerHistoryQuery>(`
      SELECT
        brawler_id AS id,
        brawler_name AS name,
        toStartOfDay(timestamp) AS timestamp,
        brawler_trophies as trophies
      FROM brawltime.brawler
      WHERE player_id=${tagToId(tag)}
      ORDER BY id, name, timestamp
      `, 'player.brawler_history')
      .then(data => data.map(row => ({
        ...row,
        timestamp: row.timestamp.slice(0, 10),
        trophies: parseInt(row.trophies),
      }) as BrawlerTrophiesRow).filter(differentFromDayBeforeBrawler))

    return { playerHistory, brawlerHistory }
  }

  public async getPlayerWinrates(tag: string) {
    tag = validateTag(tag)

    interface PlayerMetaQuery extends BattleMeasuresAggregation {
    }
    const totalStats = await this.query<PlayerMetaQuery>(`
        SELECT
          ${battleMeasuresAggregationRaw}
        FROM brawltime.battle
        WHERE player_id=${tagToId(tag)}
        AND trophy_season_end>=NOW() - INTERVAL 1 MONTH
        ORDER BY picks
      `, 'player.winrates.total')
      .then(data => data.map(row => ({
        ...parseBattleMeasures(row),
      }) as PlayerMetaRow))

    interface PlayerModeMetaQuery extends BattleMeasuresAggregation {
      mode: string
    }
    const modeStats = await this.query<PlayerModeMetaQuery>(`
        SELECT
          battle_event_mode AS mode,
          ${battleMeasuresAggregationRaw}
        FROM brawltime.battle
        WHERE player_id=${tagToId(tag)}
        AND trophy_season_end>=NOW() - INTERVAL 1 MONTH
        GROUP BY mode
        ORDER BY picks
      `, 'player.winrates.mode')
      .then(data => data.map(row => ({
        ...parseBattleMeasures(row),
        mode: row.mode,
      }) as PlayerModeMetaRow))

    interface PlayerBrawlerMetaQuery extends BattleMeasuresAggregation {
      brawlerId: string
      brawlerName: string
    }
    const brawlerStats = await this.query<PlayerBrawlerMetaQuery>(`
        SELECT
          brawler_id AS brawlerId,
          brawler_name AS brawlerName,
          ${battleMeasuresAggregationRaw}
        FROM brawltime.battle
        WHERE player_id=${tagToId(tag)}
        AND trophy_season_end>=NOW() - INTERVAL 1 MONTH
        GROUP BY brawlerId, brawlerName
        ORDER BY picks
      `, 'player.winrates.brawler')
      .then(data => data.map(row => ({
        ...parseBattleMeasures(row),
        brawlerId: parseInt(row.brawlerId),
        brawlerName: row.brawlerName,
      }) as PlayerBrawlerMetaRow))

    return <PlayerWinRatesRows> {
      total: totalStats,
      mode: modeStats,
      brawler: brawlerStats,
    }
  }

  public async getBrawlerMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    interface BrawlerMetaQuery extends BattleMeasuresAggregation {
      brawlerName: string
    }
    return await this.query<BrawlerMetaQuery>(`
        SELECT
          brawler_name AS brawlerName,
          ${battleMeasuresAggregation}
        FROM brawltime.map_meta
        WHERE ${sliceSeason()}
        AND brawler_trophyrange>=${trophyrangeLower} AND brawler_trophyrange<${trophyrangeHigher}
        GROUP BY brawlerName
        ORDER BY picks
      `, 'meta.brawler')
      .then(data => data.map(row => ({
        brawlerName: row.brawlerName,
        ...parseBattleMeasures(row),
      }) as BrawlerMetaRow))
  }

  public async getBrawlerStatistics(id: string) {
    interface BrawlerNameQuery {
      brawlerName: string
    }
    const brawlerNames = await this.query<BrawlerNameQuery>(
      `SELECT DISTINCT brawler_name AS brawlerName FROM brawltime.map_meta`,
      'brawler.names')
      .then(data => data.map(row => row.brawlerName))

    const brawlerIds = brawlerNames.map(name => brawlerId({ name }))
    if (!brawlerIds.includes(id)) {
      throw new Error('Invalid brawler id ' + id)
    }
    const brawlerName = brawlerNames[brawlerIds.indexOf(id)]

    interface ByTrophyQuery extends BattleMeasuresAggregation {
      trophyrange: string
    }
    const brawlerByTrophies = await this.query<ByTrophyQuery>(`
        SELECT
          brawler_trophyrange AS trophyrange,
          ${battleMeasuresAggregation}
        FROM brawltime.map_meta
        WHERE ${sliceSeason()}
        AND brawler_name='${brawlerName}'
        GROUP BY brawler_trophyrange
        ORDER BY picks
      `, 'brawler.by-trophies')
      .then(data => data.map(row => ({
        trophyrange: parseInt(row.trophyrange) * 100,
        ...parseBattleMeasures(row),
      }) as TrophyRow))

    const totalByTrophies = await this.query<ByTrophyQuery>(`
        SELECT
          brawler_trophyrange AS trophyrange,
          ${battleMeasuresAggregation}
        FROM brawltime.map_meta
        WHERE ${sliceSeason()}
        GROUP BY brawler_trophyrange
        ORDER BY picks
      `, 'total.by-trophies')
      .then(data => data.map(row => ({
        trophyrange: parseInt(row.trophyrange) * 100,
        ...parseBattleMeasures(row),
      }) as TrophyRow))

    return <BrawlerStatisticsRows>{
      brawlerByTrophies,
      totalByTrophies,
    }
  }

  public async getStarpowerMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    interface StarpowerMetaQuery extends BattleMeasuresAggregation {
      brawlerId: string
      brawlerName: string
      starpowerId: string
      starpowerName: string
    }
    return await this.query<StarpowerMetaQuery>(`
        SELECT
          brawler_id AS brawlerId,
          brawler_name AS brawlerName,
          brawler_starpower_id AS starpowerId,
          brawler_starpower_name AS starpowerName,
          ${battleMeasuresAggregation}
        FROM brawltime.starpower_meta
        WHERE ${sliceSeason()}
        AND brawler_trophyrange>=${trophyrangeLower} AND brawler_trophyrange<${trophyrangeHigher}
        GROUP BY brawlerId, brawlerName, starpowerId, starpowerName
        ORDER BY picks
      `, 'meta.starpower')
      .then(data => data.map(row => ({
        ...parseBattleMeasures(row),
        brawlerId: parseInt(row.brawlerId),
        brawlerName: row.brawlerName,
        starpowerId: parseInt(row.starpowerId),
        starpowerName: row.starpowerName,
      }) as StarpowerMetaRow))
  }

  public async getGadgetMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    interface GadgetMetaQuery extends BattleMeasuresAggregation {
      brawlerId: string
      brawlerName: string
      gadgetId: string
      gadgetName: string
    }
    return await this.query<GadgetMetaQuery>(`
        SELECT
          brawler_id AS brawlerId,
          brawler_name AS brawlerName,
          brawler_gadget_id AS gadgetId,
          brawler_gadget_name AS gadgetName,
          ${battleMeasuresAggregation}
        FROM brawltime.gadget_meta
        WHERE ${sliceSeason()}
        AND brawler_trophyrange>=${trophyrangeLower} AND brawler_trophyrange<${trophyrangeHigher}
        GROUP BY brawlerId, brawlerName, gadgetId, gadgetName
        ORDER BY picks
      `, 'meta.gadget')
      .then(data => data.map(row => ({
        ...parseBattleMeasures(row),
        brawlerId: parseInt(row.brawlerId),
        brawlerName: row.brawlerName,
        gadgetId: parseInt(row.gadgetId),
        gadgetName: row.gadgetName,
      }) as GadgetMetaRow))
  }

  public async getModeMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    interface ModeMetaQuery extends BattleMeasuresAggregation {
      brawlerName: string
      mode: string
    }
    return await this.query<ModeMetaQuery>(`
        SELECT
          brawler_name AS brawlerName,
          battle_event_mode AS mode,
          ${battleMeasuresAggregation}
        FROM brawltime.map_meta
        WHERE ${sliceSeason()}
        AND brawler_trophyrange>=${trophyrangeLower} AND brawler_trophyrange<${trophyrangeHigher}
        GROUP BY brawlerName, mode
        ORDER BY picks
      `, 'meta.mode')
      .then(data => data.map(row => ({
        ...parseBattleMeasures(row),
        brawlerName: row.brawlerName,
        mode: row.mode,
      }) as ModeMetaRow))
  }

  public async getMapMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    interface MapMetaQuery extends BattleMeasuresAggregation {
      brawlerName: string
      mode: string
      map: string
      id: string
      isBigbrawler: string
    }
    return await this.query<MapMetaQuery>(`
        SELECT
          brawler_name AS brawlerName,
          battle_event_mode AS mode,
          battle_event_map AS map,
          battle_event_id AS id,
          battle_is_bigbrawler AS isBigbrawler,
          ${battleMeasuresAggregation}
        FROM brawltime.map_meta
        WHERE ${sliceSeason()}
        AND brawler_trophyrange>=${trophyrangeLower} AND brawler_trophyrange<${trophyrangeHigher}
        GROUP BY brawlerName, mode, map, id, isBigbrawler
        ORDER BY picks
      `, 'meta.map')
      .then(data => data.map(row => ({
        ...parseBattleMeasures(row),
        brawlerName: row.brawlerName,
        mode: row.mode,
        map: row.map,
        id: parseInt(row.id),
        isBigbrawler: row.isBigbrawler == '1',
      }) as MapMetaRow))
  }
}
