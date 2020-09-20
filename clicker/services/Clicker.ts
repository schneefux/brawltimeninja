import ClickHouse from '@apla/clickhouse';
import StatsD from 'hot-shots'
import { Player, BattleLog, BattlePlayer } from '~/model/Brawlstars';
import { performance } from 'perf_hooks';
import { BrawlerMetaRow, StarpowerMetaRow, GadgetMetaRow, ModeMetaRow, MapMetaRow, PlayerMetaRow, PlayerModeMetaRow, PlayerBrawlerMetaRow, BattleMeasures, LeaderboardRow, BrawlerLeaderboardRow, PlayerWinRatesRows, BrawlerStatisticsRows, TrophyRow, TrophiesRow, PlayerHistoryRows, BrawlerTrophiesRow } from '~/model/Clicker';
import { brawlerId, sloppyParseFloat, idToTag, tagToId, validateTag, getSeasonEnd, formatClickhouse, getCurrentSeasonEnd, formatClickhouseDate } from '../lib/util';
import MapMetaCube from './MapMetaCube';
import GadgetMetaCube from './GadgetMetaCube';
import StarpowerMetaCube from './StarpowerMetaCube';
import LeaderboardCube from './LeaderboardCube';
import Cube, { Order } from './Cube';
import BrawlerLeaderboardCube from './BrawlerLeaderboardCube';
import { stripIndent } from 'common-tags';

const dbHost = process.env.CLICKHOUSE_HOST || ''
const stats = new StatsD({ prefix: 'brawltime.clicker.' })
const balanceChangesDate = new Date(Date.parse(process.env.BALANCE_CHANGES_DATE || '2020-07-01'))
const seasonSliceStart = getSeasonEnd(balanceChangesDate);

console.log(`querying data >= ${seasonSliceStart}`)

// ! starplayer applies only to player
const battleMeasuresAggregationRaw = stripIndent`
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


export default class ClickerService {
  private ch: ClickHouse;

  private mapMetaCube = new MapMetaCube()
  private gadgetMetaCube = new GadgetMetaCube()
  private starpowerMetaCube = new StarpowerMetaCube()
  private leaderboardCube = new LeaderboardCube()
  private brawlerLeaderboardCube = new BrawlerLeaderboardCube()

  constructor() {
    this.ch = new ClickHouse(dbHost)
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

    const playerColumns = stripIndent`
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

    const brawlerColumns = stripIndent`
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
    await this.ch.querying(stripIndent`
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
        battle_event_powerplay UInt8 Codec(Gorilla, LZ4HC),
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

    await this.ch.querying(stripIndent`
      ALTER TABLE brawltime.battle ADD COLUMN IF NOT EXISTS battle_event_powerplay UInt8 Codec(Gorilla, LZ4HC) AFTER battle_event_map
    `)

    //
    // player brawler table
    //
    await this.ch.querying(stripIndent`
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

    await this.mapMetaCube.up(this.ch)
    await this.gadgetMetaCube.up(this.ch)
    await this.starpowerMetaCube.up(this.ch)
    await this.leaderboardCube.up(this.ch)
    await this.brawlerLeaderboardCube.up(this.ch)
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
      `SELECT formatDateTime(MAX(timestamp), '%FT%TZ', 'UTC') AS maxTimestamp FROM brawltime.battle WHERE trophy_season_end>=toDateTime('${formatClickhouse(seasonSliceStart)}', 'UTC') AND player_id=${tagToId(player.tag)}`,
      'player.get_last')
    // if not found, clickhouse max() defaults to 0000 date (Date.parse returns NaN)
    const lastBattleTimestamp = maxTimestamp[0].maxTimestamp.startsWith('0000') ? seasonSliceStart : new Date(Date.parse(maxTimestamp[0].maxTimestamp))

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
      stats.increment('player.insert.prepare')

      if (battle.battle.type == 'friendly') {
        // ignore
        // in friendlies, players can play brawlers without owning them -> myBrawler is undefined
        console.log(`ignoring friendly battle for ${player.tag} (${tagToId(player.tag)})`)
        stats.increment('player.insert.skip')
        continue
      }

      if (battle.battleTime <= lastBattleTimestamp) {
        // duplicate
        console.log(`ignoring old battle (${battle.battleTime.toISOString()} <= ${lastBattleTimestamp.toISOString()}) for ${player.tag} (${tagToId(player.tag)})`)
        stats.increment('player.insert.skip')
        continue
      }

      const teamsWithoutBigBrawler = (battle.battle.teams !== undefined ? battle.battle.teams : battle.battle.players!.map((p) => [p]))
      const teams = battle.battle.bigBrawler !== undefined ? teamsWithoutBigBrawler.concat([[battle.battle.bigBrawler]]) : teamsWithoutBigBrawler

      const myTeamIndex = teams.findIndex(t => t.find(p => p.tag == player.tag))
      if (myTeamIndex == -1) {
        console.log(`ignoring bot battle for ${player.tag} (${tagToId(player.tag)})`)
        stats.increment('player.insert.skip')
        continue // replaced by bot?
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

      const trophyRange = Math.floor(me.brawler.trophies / 100)

      const allies = myTeam.filter(p => p.tag !== player.tag)
      const enemies = (<BattlePlayer[]>[]).concat(...teams.filter(t => t !== myTeam))

      const isPowerplay = floatingVictory != null && battle.battle.trophyChange != null
        // all brawlers use a star power
        && allies.every(a => a.brawler.power == 10) && enemies.every(a => a.brawler.power == 10)
        // victory
        //   - regular battles give +11 max (+10 +3 underdog) on victory
        //   - power play at least 18
        // draw
        //   - regular battles +3 max (0 +3 underdog)
        //   - power play 18 or 15
        // defeat
        //   - regular battles max +3 (0 +3 underdog) in Showdown <50 trophies
        //   - power play at least 2
        //   - this is not 100% accurate but a collision is unlikely
        // https://brawlstars.fandom.com/wiki/Power_Play
        // https://brawlstars.fandom.com/wiki/Trophies
        && (floatingVictory > 0.5 && battle.battle.trophyChange >= 15
          || floatingVictory == 0.5 && battle.battle.trophyChange >= 5
          || floatingVictory < 0.5 && battle.battle.trophyChange >= 2)

      const record = {
        timestamp: battle.battleTime,
        trophy_season_end: getSeasonEnd(battle.battleTime),
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
        battle_event_powerplay: isPowerplay,
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
        stats.increment('player.insert.run')
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
      stats.increment('brawler.insert.prepare')

      const record = {
        timestamp: formatClickhouseDate(new Date()),
        trophy_season_end: getCurrentSeasonEnd(), // will be formatted by node-clickhouse
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
        stats.increment('brawler.insert.run')
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

  public async getTopByMetric(metric: string, limit: number) {
    const metrics = {
      'expPoints': 'player_exp_points',
      'trophies': 'player_trophies',
      'powerPlayPoints': 'player_power_play_points',
      'victories': 'player_3vs3_victories',
      'soloVictories': 'player_solo_victories',
      'duoVictories': 'player_duo_victories',
    }

    const metricMeasure = ((<any>metrics)[metric] || metric) as any
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const rows = await this.leaderboardCube.query(this.ch,
      'leaderboard',
      [metricMeasure, 'player_name'],
      ['player_id'],
      {
        'timestamp': [formatClickhouse(oneWeekAgo)],
      },
      { [metricMeasure]: 'desc' },
      limit,
    )

    return rows.data.map(r => (<Partial<LeaderboardRow>>{
      name: r.player_name,
      tag: idToTag(r.player_id).replace('#', ''),
      id: r.player_id,
      [metric]: r[metricMeasure],
    }))
  }

  public async getTopBrawlerByMetric(brawlerId: string, metric: string, limit: number) {
    const metrics = {
      'trophies': 'brawler_trophies',
      'highestTrophies': 'brawler_highest_trophies',
    }

    if (isNaN(parseInt(brawlerId))) {
      console.error('invalid brawlerId', brawlerId)
      return []
    }

    const metricMeasure = ((<any>metrics)[metric] || metric) as any
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const rows = await this.brawlerLeaderboardCube.query(this.ch,
      'brawler_leaderboard',
      [metricMeasure, 'player_name'],
      ['player_id'],
      {
        'timestamp': [formatClickhouse(oneWeekAgo)],
      },
      { [metricMeasure]: 'desc' },
      limit,
    )

    return rows.data.map(r => (<Partial<BrawlerLeaderboardRow>>{
      name: r.player_name,
      brawlerName: r.brawler_name,
      tag: idToTag(r.player_id).replace('#', ''),
      id: r.player_id,
      [metric]: r[metricMeasure],
    }))
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
    const playerHistory = await this.query<PlayerHistoryQuery>(stripIndent`
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
    const brawlerHistory = await this.query<BrawlerHistoryQuery>(stripIndent`
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
    const totalStats = await this.query<PlayerMetaQuery>(stripIndent`
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
    const modeStats = await this.query<PlayerModeMetaQuery>(stripIndent`
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
    const brawlerStats = await this.query<PlayerBrawlerMetaQuery>(stripIndent`
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
    const rows = await this.mapMetaCube.query(this.ch,
      'meta.brawler',
      ['*'],
      ['brawler_name'],
      {
        'brawler_trophyrange': [trophyrangeLower, trophyrangeHigher],
        'trophy_season_end': ['balance'],
      },
      { 'picks': 'asc' },
    )

    return rows.data.map(r => (<BrawlerMetaRow>{
      brawlerName: r.brawler_name,
      duration: r.battle_duration,
      level: r.battle_level,
      picks: r.picks,
      picksWeighted: r.picks_weighted,
      rank: r.battle_rank,
      rank1Rate: r.battle_rank1,
      starRate: r.battle_starplayer,
      timestamp: r.timestamp,
      trophyChange: r.battle_trophy_change,
      winRate: r.battle_victory,
    }))
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

    const trophyRows = await this.mapMetaCube.query(this.ch,
      'brawler.by-trophies',
      ['*'],
      ['brawler_trophyrange'],
      {
        'trophy_season_end': ['balance'],
        'brawler_name': [brawlerName],
      },
      { 'picks': 'asc' },
    )
    const brawlerByTrophies = trophyRows.data.map(r => (<TrophyRow>{
      trophyrange: r.brawler_trophyrange * 100,
      duration: r.battle_duration,
      level: r.battle_level,
      picks: r.picks,
      picksWeighted: r.picks_weighted,
      rank: r.battle_rank,
      rank1Rate: r.battle_rank1,
      starRate: r.battle_starplayer,
      timestamp: r.timestamp,
      trophyChange: r.battle_trophy_change,
      winRate: r.battle_victory,
    }))

    const totalRows = await this.mapMetaCube.query(this.ch,
      'total.by-trophies',
      ['*'],
      ['brawler_trophyrange'],
      {
        'trophy_season_end': ['balance'],
      },
      { 'picks': 'asc' },
    )
    const totalByTrophies = totalRows.data.map(r => (<TrophyRow>{
      trophyrange: r.brawler_trophyrange * 100,
      duration: r.battle_duration,
      level: r.battle_level,
      picks: r.picks,
      picksWeighted: r.picks_weighted,
      rank: r.battle_rank,
      rank1Rate: r.battle_rank1,
      starRate: r.battle_starplayer,
      timestamp: r.timestamp,
      trophyChange: r.battle_trophy_change,
      winRate: r.battle_victory,
    }))

    return <BrawlerStatisticsRows>{
      brawlerByTrophies,
      totalByTrophies,
    }
  }

  public async getStarpowerMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    const rows = await this.starpowerMetaCube.query(this.ch,
      'meta.starpower',
      ['*'],
      ['brawler_id', 'brawler_name', 'brawler_starpower_id', 'brawler_starpower_name'],
      {
        'brawler_trophyrange': [trophyrangeLower, trophyrangeHigher],
        'trophy_season_end': ['balance'],
      },
      { 'picks': 'asc' },
    )

    return rows.data.map(r => (<StarpowerMetaRow>{
      brawlerName: r.brawler_name,
      duration: r.battle_duration,
      level: r.battle_level,
      picks: r.picks,
      picksWeighted: r.picks_weighted,
      rank: r.battle_rank,
      rank1Rate: r.battle_rank1,
      starRate: r.battle_starplayer,
      timestamp: r.timestamp,
      trophyChange: r.battle_trophy_change,
      winRate: r.battle_victory,
      brawlerId: r.brawler_id,
      starpowerId: r.brawler_starpower_id,
      starpowerName: r.brawler_starpower_name,
    }))
  }

  public async getGadgetMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    const rows = await this.gadgetMetaCube.query(this.ch,
      'meta.gadget',
      ['*'],
      ['brawler_id', 'brawler_name', 'brawler_gadget_id', 'brawler_gadget_name'],
      {
        'brawler_trophyrange': [trophyrangeLower, trophyrangeHigher],
        'trophy_season_end': ['balance'],
      },
      { 'picks': 'asc' },
    )

    return rows.data.map(r => (<GadgetMetaRow>{
      brawlerName: r.brawler_name,
      duration: r.battle_duration,
      level: r.battle_level,
      picks: r.picks,
      picksWeighted: r.picks_weighted,
      rank: r.battle_rank,
      rank1Rate: r.battle_rank1,
      starRate: r.battle_starplayer,
      timestamp: r.timestamp,
      trophyChange: r.battle_trophy_change,
      winRate: r.battle_victory,
      brawlerId: r.brawler_id,
      gadgetId: r.brawler_gadget_id,
      gadgetName: r.brawler_gadget_name,
    }))
  }

  public async getModeMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    const rows = await this.mapMetaCube.query(this.ch,
      'meta.mode',
      ['*'],
      ['brawler_name', 'battle_event_mode'],
      {
        'brawler_trophyrange': [trophyrangeLower, trophyrangeHigher],
        'trophy_season_end': ['balance'],
      },
      { 'picks': 'asc' },
    )

    return rows.data.map(r => (<ModeMetaRow>{
      brawlerName: r.brawler_name,
      duration: r.battle_duration,
      level: r.battle_level,
      mode: r.battle_event_mode,
      picks: r.picks,
      picksWeighted: r.picks_weighted,
      rank: r.battle_rank,
      rank1Rate: r.battle_rank1,
      starRate: r.battle_starplayer,
      timestamp: r.timestamp,
      trophyChange: r.battle_trophy_change,
      winRate: r.battle_victory,
    }))
  }

  public async getMapMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    const rows = await this.mapMetaCube.query(this.ch,
      'meta.map',
      ['*'],
      ['brawler_name', 'battle_event_mode', 'battle_event_map', 'battle_event_id', 'battle_is_bigbrawler'],
      {
        'brawler_trophyrange': [trophyrangeLower, trophyrangeHigher],
        'trophy_season_end': ['balance'],
      },
      { 'picks': 'asc' },
    )

    return rows.data.map(r => (<MapMetaRow>{
      brawlerName: r.brawler_name,
      duration: r.battle_duration,
      id: r.battle_event_id,
      isBigbrawler: r.battle_is_bigbrawler,
      level: r.battle_level,
      map: r.battle_event_map,
      mode: r.battle_event_mode,
      picks: r.picks,
      picksWeighted: r.picks_weighted,
      rank: r.battle_rank,
      rank1Rate: r.battle_rank1,
      starRate: r.battle_starplayer,
      timestamp: r.timestamp,
      trophyChange: r.battle_trophy_change,
      winRate: r.battle_victory,
    }))
  }

  private getCubeByName(cubeName: string): Cube<any> {
    switch (cubeName) {
      case 'player':
        return this.leaderboardCube
      case 'brawler':
        return this.brawlerLeaderboardCube
      case 'map':
        return this.mapMetaCube
      case 'gadget':
        return this.gadgetMetaCube
      case 'starpower':
        return this.starpowerMetaCube
      default:
        throw new Error('Invalid cube: ' + cubeName)
    }
  }

  public getCubeMetadata(cubeName: string) {
    const cube = this.getCubeByName(cubeName)
    return {
      dimensions: cube.dimensions,
      measures: Object.keys(cube.measures),
      slices: cube.slices,
    }
  }

  public async queryCube(cubeName: string,
      measures: string[],
      dimensions: string[],
      slices: { [name: string]: string[] },
      order: { [column: string]: Order },
      limit: number) {
    const cube = this.getCubeByName(cubeName)
    limit = Math.min(1000, limit)

    console.log('executing cube query', cubeName, measures, dimensions, slices, order, limit)
    return await cube.query(this.ch,
      'cube.' + cubeName + '.' + dimensions.join(','),
      measures,
      dimensions,
      slices,
      order,
      limit,
    )
  }
}
