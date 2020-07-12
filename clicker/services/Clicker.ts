import ClickHouse from '@apla/clickhouse';
import { Player, BattleLog, BattlePlayer } from '~/model/Brawlstars';
import { LeaderboardEntry } from '~/model/Leaderboard';
import History, { PlayerHistoryEntry, BrawlerHistoryEntry } from '~/model/History';
import { MetaModeEntry, MetaStarpowerEntry, MetaBrawlerEntry, MetaMapEntry, PlayerMetaModeEntry, MetaGadgetEntry } from '~/model/MetaEntry';
import { PlayerWinRates } from '~/model/PlayerWinRates';

const dbHost = process.env.CLICKHOUSE_HOST || '';

/*
  TODO create materialized views:
    -- sorting key: all dimensions
    -- pk must be prefix of sk
    ORDER BY (trophy_season_end, player_tag, brawler_trophyrange, battle_event_mode, battle_event_map, brawler_name, brawler_starpower_name, brawler_gadget_name)
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
  const seasonEnd = getSeasonEnd(new Date())
  const seasonEndFormatted = seasonEnd.toISOString()
    .slice(0, 19) // remove fractions and time zone
    .replace('T', ' ')
  return `trophy_season_end>=toDateTime('${seasonEndFormatted}', 'UTC')`
}

function sloppyParseFloat(number: string) {
  return Math.floor(parseFloat(number) * 100) / 100
}

function validateTag(tag: string) {
  if (! /^[0289PYLQGRJCUV]{3,}$/.test(tag)) {
    throw new Error('Invalid tag')
  }
  if (!tag.startsWith('#')) {
    return '#' + tag
  }
  return tag
}

export default class ClickerService {
  private ch: ClickHouse;

  constructor() {
    this.ch = new ClickHouse(dbHost);
  }

  public async migrate() {
    await this.ch.querying('CREATE DATABASE IF NOT EXISTS brawltime')
    await this.ch.querying(`
      CREATE TABLE IF NOT EXISTS brawltime.battle (
        timestamp DateTime,
        -- calculated
        trophy_season_end DateTime,
        -- player
        player_tag String,
        player_name String,
        player_name_color FixedString(10), -- 0x + 8 hex chars
        player_icon_id UInt32,
        player_trophies UInt32,
        player_highest_trophies UInt32,
        player_power_play_points UInt16,
        player_highest_power_play_points UInt16,
        player_exp_points UInt32,
        player_is_qualified_from_championship_challenge UInt8,
        player_3vs3_victories UInt32,
        player_solo_victories UInt32,
        player_duo_victories UInt32,
        player_best_robo_rumble_time UInt16,
        player_best_time_as_big_brawler UInt16,
        -- calculated
        player_brawlers_length UInt8,
        -- player club
        player_club_tag String,
        player_club_name String,
        -- player brawler
        -- ommitted, not needed
        -- brawler
        brawler_id UInt32,
        brawler_name LowCardinality(String),
        brawler_power UInt8,
        brawler_trophies UInt16,
        brawler_highest_trophies UInt16,
        -- calculated
        brawler_trophyrange UInt8,
        -- brawler starpower
        brawler_starpower_found UInt8,
        brawler_starpower_id UInt32,
        brawler_starpower_name LowCardinality(String),
        -- brawler gadget
        brawler_gadget_found UInt8,
        brawler_gadget_id UInt32,
        brawler_gadget_name LowCardinality(String),
        -- starpowers (nested)
        brawler_starpowers Nested (
          id UInt32,
          name LowCardinality(String)
        ),
        brawler_starpowers_length UInt16,
        -- gadgets (nested)
        brawler_gadgets Nested (
          id UInt32,
          name LowCardinality(String)
        ),
        brawler_gadgets_length UInt16,
        -- battle event
        battle_event_id UInt32,
        battle_event_mode LowCardinality(String),
        battle_event_map LowCardinality(String),
        -- battle
        -- mode: ommitted because duplicate
        battle_type LowCardinality(String),
        battle_result LowCardinality(String),
        battle_duration Nullable(UInt16),
        battle_rank Nullable(UInt8),
        battle_trophy_change Nullable(Int8),
        battle_level_name LowCardinality(String),
        battle_level_id Nullable(UInt16),
        -- calculated
        battle_victory Nullable(Decimal32(8)),
        -- battle starplayer
        battle_starplayer_brawler_id UInt32,
        battle_starplayer_brawler_name LowCardinality(String),
        battle_starplayer_brawler_power UInt8,
        battle_starplayer_brawler_trophies UInt16,
        -- calculated
        battle_is_starplayer Nullable(UInt8),
        -- battle big brawler
        battle_bigbrawler_brawler_id UInt32,
        battle_bigbrawler_brawler_name LowCardinality(String),
        battle_bigbrawler_brawler_power UInt8,
        battle_bigbrawler_brawler_trophies UInt16,
        -- calculated
        battle_is_bigbrawler Nullable(UInt8),
        -- battle allies and enemies (nested)
        battle_allies Nested (
          player_tag String,
          player_name String,
          brawler_id UInt32,
          brawler_name LowCardinality(String),
          brawler_power UInt8,
          brawler_trophies UInt16
        ),
        battle_enemies Nested (
          player_tag String,
          player_name String,
          brawler_id UInt32,
          brawler_name LowCardinality(String),
          brawler_power UInt8,
          brawler_trophies UInt16
        )
      )
      ENGINE = MergeTree()
      -- there are no unique checks!
      -- memory consumption for the index is pk size * pk cardinality / index granularity
      -- 12B + 8B + 4B, 1B players, 1/25 granualarity -> about 1MB
      ORDER BY (player_tag, timestamp, cityHash64(player_tag))
      PARTITION BY trophy_season_end
      SAMPLE BY cityHash64(player_tag)
      -- TTL timestamp + INTERVAL 1 MONTH DELETE
      -- 25 battles per query
      SETTINGS index_granularity=25
    `)
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
    const maxTimestampQueryResult = await this.ch.querying(
      `SELECT MAX(timestamp) AS maxTimestamp FROM brawltime.battle WHERE ${sliceSeason()} AND player_tag='${player.tag}'`,
      { dataObjects: true, readonly: true })
    const lastBattleTimestamp = new Date(Date.parse(maxTimestampQueryResult.data[0].maxTimestamp))

    const stream = this.ch.query('INSERT INTO brawltime.battle', { format: 'JSONEachRow' })

    // insert records for meta stats
    await Promise.all(battles.map(async (battle) => {
      if(battle.battle.type == 'friendly') {
        // ignore
        // in friendlies, players can play brawlers without owning them -> myBrawler is undefined
        return
      }

      if (battle.battleTime < lastBattleTimestamp) {
        // duplicate
        return
      }

      const teamsWithoutBigBrawler = (battle.battle.teams !== undefined ? battle.battle.teams : battle.battle.players!.map((p) => [p]))
      const teams = battle.battle.bigBrawler !== undefined ? teamsWithoutBigBrawler.concat([[battle.battle.bigBrawler]]) : teamsWithoutBigBrawler

      const myTeamIndex = teams.findIndex(t => t.find(p => p.tag == player.tag))
      if(myTeamIndex == -1) {
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
        /* player */
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
        player_club_tag: player.club?.tag,
        player_club_name: player.club?.name,
        /* player brawler */
        // ommitted, not needed
        /* brawler */
        brawler_id: myBrawler.id,
        brawler_name: myBrawler.name || 'NANI', // FIXME API bug 2020-06-06
        brawler_power: me.brawler.power,
        brawler_trophies: me.brawler.trophies,
        brawler_highest_trophies: myBrawler.highestTrophies,
        // calculated
        brawler_trophyrange: trophyRange,
        /* brawler starpower */
        brawler_starpower_found: myStarpower !== undefined,
        brawler_starpower_id: myStarpower?.id,
        brawler_starpower_name: myStarpower?.name,
        /* brawler gadget */
        brawler_gadget_found: myGadget !== undefined,
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
        'battle_allies.player_tag': allies.map(a => a.tag),
        'battle_allies.player_name': allies.map(a => a.name),
        'battle_allies.brawler_id': allies.map(a => a.brawler.id),
        'battle_allies.brawler_name': allies.map(a => a.brawler.name),
        'battle_allies.brawler_power': allies.map(a => a.brawler.power),
        'battle_allies.brawler_trophies': allies.map(a => a.brawler.trophies),
        /* battle enemies (nested) */
        'battle_enemies.player_tag': enemies.map(e => e.tag),
        'battle_enemies.player_name': enemies.map(e => e.name),
        'battle_enemies.brawler_id': enemies.map(e => e.brawler.id),
        'battle_enemies.brawler_name': enemies.map(e => e.brawler.name),
        'battle_enemies.brawler_power': enemies.map(e => e.brawler.power),
        'battle_enemies.brawler_trophies': enemies.map(e => e.brawler.trophies),
      }

      // to debug encoding errors:
      // console.log(require('@apla/clickhouse/src/process-db-value').encodeRow(record, (<any>stream).format))
      stream.write(record)
    }))

    stream.end()
  }

  public async getTopByExp(n: number): Promise<LeaderboardEntry[]> {
    return await this.ch.querying(`
      SELECT
        player_name AS name,
        player_tag AS tag,
        MAX(player_exp_points) AS total_exp
      FROM brawltime.battle
      WHERE ${sliceSeason()}
      GROUP BY player_name, player_tag
      ORDER BY total_exp DESC
      LIMIT ${n}
      `, { dataObjects: true, readonly: true })
      .then(response => response.data.map(row => ({
        ...row,
        tag: row.tag.replace('#', ''),
        total_exp: parseInt(row.total_exp),
      }) as LeaderboardEntry))
  }

  public async getHistory(tag: string): Promise<History> {
    tag = validateTag(tag)

    const brawlerHistory = await this.ch.querying(`
      SELECT
        brawler_name AS name,
        toStartOfHour(timestamp) AS timestamp,
        MAX(brawler_trophies) AS trophies
      FROM brawltime.battle
      WHERE player_tag='${tag}'
      GROUP BY name, timestamp
      ORDER BY timestamp
      `, { dataObjects: true, readonly: true })
      .then(response => response.data.map(row => ({
        ...row,
        trophies: parseInt(row.trophies),
      }) as BrawlerHistoryEntry))

    const playerHistory = await this.ch.querying(`
      SELECT
        toStartOfHour(timestamp) AS timestamp,
        MAX(player_trophies) AS trophies
      FROM brawltime.battle
      WHERE player_tag='${tag}'
      GROUP BY timestamp
      ORDER BY timestamp
      `, { dataObjects: true, readonly: true })
      .then(response => response.data.map(row => ({
        ...row,
        trophies: parseInt(row.trophies),
      }) as PlayerHistoryEntry))

    return { brawlerHistory, playerHistory }
  }

  public async getPlayerWinrates(tag: string): Promise<PlayerWinRates> {
    tag = validateTag(tag)

    const modeStats = await this.ch.querying(`
        SELECT
          battle_event_mode AS mode,
          COUNT(*) AS picks,
          AVG(battle_victory) AS winRate,
          AVG(battle_duration) AS duration,
          AVG(battle_rank) AS rank,
          AVG(battle_rank=1) AS rank1Rate,
          AVG(battle_is_starplayer) AS starRate,
          AVG(battle_trophy_change) AS trophyChange
        FROM brawltime.battle
        WHERE player_tag='${tag}'
        GROUP BY mode
        ORDER BY picks
      `, { dataObjects: true, readonly: true })
      .then(response => response.data.map(row => ({
        ...row,
        picks: parseInt(row.picks),
        winRate: sloppyParseFloat(row.winRate),
        duration: sloppyParseFloat(row.duration),
        rank: sloppyParseFloat(row.rank),
        rank1Rate: sloppyParseFloat(row.rank1Rate),
        starRate: sloppyParseFloat(row.starRate),
        trophyChange: sloppyParseFloat(row.trophyChange),
      }) as PlayerMetaModeEntry))
    return <PlayerWinRates> {
      mode: modeStats,
    }
  }

  public async getBrawlerMeta(trophyrangeLower: string, trophyrangeHigher: string): Promise<MetaBrawlerEntry[]> {
    return await this.ch.querying(`
      SELECT
        arrayJoin(arrayConcat(battle_allies.brawler_name, [brawler_name])) as name,
        COUNT() as picks,
        AVG(battle_victory) as winRate,
        AVG(name=battle_starplayer_brawler_name) as starRate
      FROM brawltime.battle
      WHERE ${sliceSeason()}
      AND brawler_trophyrange>=${trophyrangeLower} AND brawler_trophyrange<${trophyrangeHigher}
      GROUP BY name
      ORDER BY picks
    `, { dataObjects: true, readonly: true })
    .then(response => response.data.map(row => ({
      ...row,
      picks: parseInt(row.picks),
      winRate: sloppyParseFloat(row.winRate),
      starRate: sloppyParseFloat(row.starRate),
    }) as MetaBrawlerEntry))
  }

  public async getStarpowerMeta(trophyrangeLower: string, trophyrangeHigher: string): Promise<MetaStarpowerEntry[]> {
    return await this.ch.querying(`
        SELECT
          brawler_id AS brawlerId,
          brawler_name AS brawlerName,
          brawler_starpower_id AS starpowerId,
          brawler_starpower_name AS starpowerName,
          COUNT(*) AS picks,
          AVG(battle_victory) AS winRate,
          AVG(battle_rank=1) AS rank1Rate,
          AVG(battle_is_starplayer) AS starRate
        FROM brawltime.battle
        WHERE ${sliceSeason()}
        AND brawler_trophyrange>=${trophyrangeLower} AND brawler_trophyrange<${trophyrangeHigher}
        GROUP BY brawlerId, brawlerName, starpowerId, starpowerName
        ORDER BY picks
      `, { dataObjects: true, readonly: true })
      .then(response => response.data.map(row => ({
        ...row,
        picks: parseInt(row.picks),
        winRate: sloppyParseFloat(row.winRate),
        rank1Rate: sloppyParseFloat(row.rank1Rate),
        starRate: sloppyParseFloat(row.starRate),
      }) as MetaStarpowerEntry))
  }

  public async getGadgetMeta(trophyrangeLower: string, trophyrangeHigher: string): Promise<MetaGadgetEntry[]> {
    return await this.ch.querying(`
        SELECT
          brawler_id AS brawlerId,
          brawler_name AS brawlerName,
          brawler_gadget_id AS gadgetId,
          brawler_gadget_name AS gadgetName,
          COUNT(*) AS picks,
          AVG(battle_victory) AS winRate,
          AVG(battle_rank=1) AS rank1Rate,
          AVG(battle_is_starplayer) AS starRate
        FROM brawltime.battle
        WHERE ${sliceSeason()}
        AND brawler_trophyrange>=${trophyrangeLower} AND brawler_trophyrange<${trophyrangeHigher}
        GROUP BY brawlerId, brawlerName, gadgetId, gadgetName
        ORDER BY picks
      `, { dataObjects: true, readonly: true })
      .then(response => response.data.map(row => ({
        ...row,
        picks: parseInt(row.picks),
        winRate: sloppyParseFloat(row.winRate),
        rank1Rate: sloppyParseFloat(row.rank1Rate),
        starRate: sloppyParseFloat(row.starRate),
      }) as MetaGadgetEntry))
  }

  public async getModeMeta(trophyrangeLower: string, trophyrangeHigher: string): Promise<MetaModeEntry[]> {
    return await this.ch.querying(`
        SELECT
          arrayJoin(arrayConcat(battle_allies.brawler_name, [brawler_name])) as name,
          battle_event_mode AS mode,
          COUNT() as picks,
          AVG(battle_rank) AS rank,
          AVG(battle_rank=1) AS rank1Rate,
          AVG(battle_victory) AS winRate,
          AVG(battle_duration) AS duration,
          AVG(name=battle_starplayer_brawler_name) AS starRate
        FROM brawltime.battle
        WHERE ${sliceSeason()}
        AND brawler_trophyrange>=${trophyrangeLower} AND brawler_trophyrange<${trophyrangeHigher}
        GROUP BY name, mode
        ORDER BY picks
      `, { dataObjects: true, readonly: true })
      .then(response => response.data.map(row => ({
        ...row,
        picks: parseInt(row.picks),
        rank: sloppyParseFloat(row.rank),
        rank1Rate: sloppyParseFloat(row.rank1Rate),
        winRate: sloppyParseFloat(row.winRate),
        duration: sloppyParseFloat(row.duration),
        starRate: sloppyParseFloat(row.starRate),
      }) as MetaModeEntry))
  }

  public async getMapMeta(trophyrangeLower: string, trophyrangeHigher: string): Promise<MetaMapEntry[]> {
    return await this.ch.querying(`
        SELECT
          battle_event_id AS id,
          battle_event_mode AS mode,
          battle_event_map AS map,
          arrayJoin(arrayConcat(battle_allies.brawler_name, [brawler_name])) AS name,
          battle_is_bigbrawler AS isBigbrawler,

          COUNT(*) AS picks,
          AVG(battle_duration) AS duration,
          AVG(battle_rank) AS rank,
          SUM(battle_rank=1) AS rank1,
          SUM(battle_victory) AS wins,
          AVG(battle_is_starplayer) AS starRate,
          AVG(battle_level_id) AS level
        FROM brawltime.battle
        WHERE ${sliceSeason()}
        AND brawler_trophyrange>=${trophyrangeLower} AND brawler_trophyrange<${trophyrangeHigher}
        GROUP BY id, mode, map, name, isBigbrawler
        ORDER BY picks
      `, { dataObjects: true, readonly: true })
      .then(response => response.data.map(row => ({
        ...row,
        picks: parseInt(row.picks),
        duration: sloppyParseFloat(row.duration),
        rank: sloppyParseFloat(row.rank),
        rank1: parseInt(row.rank1),
        wins: parseInt(row.wins),
        starRate: sloppyParseFloat(row.starRate),
        level: sloppyParseFloat(row.level),
      }) as MetaMapEntry))
  }
}
