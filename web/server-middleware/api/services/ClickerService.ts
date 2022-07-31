import ClickHouse from '@apla/clickhouse'
import { ClickHouse as ClickHouse2 } from 'clickhouse'
import StatsD from 'hot-shots'
import { Player, BattleLog, BattlePlayer, BattlePlayerMultiple } from '../model/Brawlstars'
import { performance } from 'perf_hooks'
import { parseApiTime, tagToId, validateTag, getSeasonEnd, formatClickhouse, formatClickhouseDate } from '../../../lib/util'

const dbHost = process.env.CLICKHOUSE_HOST || ''
const stats = new StatsD({ prefix: 'brawltime.clicker.' })
const twoMonths = 2*4*7*24*60*60*1000
const balanceChangesDate = new Date(Date.parse(process.env.BALANCE_CHANGES_DATE || '') || (Date.now() - twoMonths))
const seasonSliceStart = getSeasonEnd(balanceChangesDate);

console.log(`querying data >= ${seasonSliceStart}`)

export default class ClickerService {
  // readonly
  private chRo: ClickHouse2;

  constructor() {
    // use 1 thread -> server can handle more queries
    // player queries take about 25% longer than with 4 threads
    this.chRo = new ClickHouse2({
      url: dbHost,
      config: {
        readonly: 1,
        max_threads: 1,
        output_format_json_quote_64bit_integers: 1,
      },
      // clickhouse allows only a single query per session!
      isSessionPerQuery: true,
    } as any)
  }

  private insert(sql: string, callback: (error?: Error) => void) {
    // only this client supports JSON insert streams
    // this client has no support for sessions
    // => create a new client = create a new session
    const ch = new ClickHouse(dbHost)
    return ch.query(sql, { format: 'JSONEachRow' }, callback)
  }

  // ro query
  private async query<T>(query: string, metricName: string): Promise<T[]> {
    stats.increment(metricName + '.run')
    return stats.asyncTimer(() =>
      this.chRo.query(query).toPromise() as Promise<T[]>
    , metricName + '.timer')()
  }

  public async store(entry: { player: Player, battleLog: BattleLog }) {
    const player = entry.player
    player.tag = validateTag(player.tag)

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
    // changed to 1970 in 20.7
    const lastBattleTimestamp = (maxTimestamp[0].maxTimestamp.startsWith('0000') || maxTimestamp[0].maxTimestamp.startsWith('1970')) ? seasonSliceStart : new Date(Date.parse(maxTimestamp[0].maxTimestamp))

    const battleInsertStart = performance.now()
    const battleStream = this.insert('INSERT INTO brawltime.battle', (error) => {
      stats.timing('player.insert.timer', performance.now() - battleInsertStart)
      if (error) {
        stats.increment('player.insert.error')
        console.error(`error inserting battle for ${player.tag} (${tagToId(player.tag)}): ${error}`)
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
      player_power_play_points: undefined,
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

      // note: battle is patched by api service
      if (battle.battle.type == 'friendly') {
        // ignore
        // in friendlies, players can play brawlers without owning them -> myBrawler is undefined
        console.log(`ignoring friendly battle for ${player.tag} (${tagToId(player.tag)})`)
        stats.increment('player.insert.skip')
        continue
      }

      if (battle.event == undefined || battle.event.map == null) {
        console.log(`ignoring battle without event for ${player.tag} (${tagToId(player.tag)})`)
        stats.increment('player.insert.skip')
        continue
      }

      if (battle.battleTime <= lastBattleTimestamp) {
        // duplicate
        console.log(`ignoring old battle (${battle.battleTime.toISOString()} <= ${lastBattleTimestamp.toISOString()}) for ${player.tag} (${tagToId(player.tag)})`)
        stats.increment('player.insert.skip')
        continue
      }

      const teamsWithoutBigBrawler = battle.battle.teams ?? battle.battle.players!.map((p: BattlePlayer|BattlePlayerMultiple) => [p])
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

      const brawlers = 'brawler' in me ? [me.brawler] : me.brawlers

      for (let brawler of brawlers) {
        const myBrawler = player.brawlers.find((b) => b.name == brawler.name)!
        const myStarpower = myBrawler.starPowers.length != 1 ? null : myBrawler.starPowers[0]
        const myGadget = myBrawler.gadgets.length != 1 ? null : myBrawler.gadgets[0]
        const myGear = myBrawler.gears.length != 1 ? null : myBrawler.gears[0]
        const floatingVictory =
            battle.battle.result == 'victory' ? 1.0
          : battle.battle.result == 'defeat' ? 0.0
          : battle.battle.result == 'draw' ? 0.5
          : 'rank' in battle.battle ? 1 - (battle.battle.rank! - 1) / (teams.length - 1)
          : null

        // 2020-03-18 power play is now power league
        const isPowerplay = battle.battle.type == 'soloRanked' || battle.battle.type == 'teamRanked'

        // type=tournament battles have no trophies, fall back to current brawler trophies
        const myBrawlerTrophies = brawler.trophies || myBrawler.trophies
        // power league has trophies = league level (0-19)
        const trophyRange = isPowerplay ? myBrawlerTrophies : Math.floor(myBrawlerTrophies / 100) || 0

        const allies = myTeam.filter(p => p.tag !== player.tag).flatMap(b => 'brawler' in b ? [b.brawler] : b.brawlers)
        const enemies = teams.filter(t => t !== myTeam).flatMap(t => t.flatMap(b => 'brawler' in b ? [b.brawler] : b.brawlers))

        const record = {
          timestamp: battle.battleTime,
          trophy_season_end: getSeasonEnd(battle.battleTime),
          ...playerFacts,
          /* player brawler */
          // see other table
          /* brawler */
          brawler_id: myBrawler.id,
          brawler_name: myBrawler.name,
          brawler_power: brawler.power,
          brawler_trophies: myBrawlerTrophies,
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
          /* brawler gear */
          brawler_gear_found: myGear !== null,
          brawler_gear_id: myGear?.id,
          brawler_gear_name: myGear?.name,
          brawler_gear_level: myGear?.level,
          /* starpowers (nested) */
          'brawler_starpowers.id': myBrawler?.starPowers.map(sp => sp.id),
          'brawler_starpowers.name': myBrawler?.starPowers.map(sp => sp.name),
          brawler_starpowers_length: myBrawler?.starPowers.length,
          /* gadgets (nested) */
          'brawler_gadgets.id': myBrawler?.gadgets.map(g => g.id),
          'brawler_gadgets.name': myBrawler?.gadgets.map(g => g.name),
          brawler_gadgets_length: myBrawler?.gadgets.length,
          /* gears (nested) */
          'brawler_gears.id': myBrawler?.gears.map(g => g.id),
          'brawler_gears.name': myBrawler?.gears.map(g => g.name),
          'brawler_gears.level': myBrawler?.gears.map(g => g.level),
          brawler_gears_length: myBrawler?.gears.length,
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
          'battle_allies.brawler_id': allies.map(b => b.id),
          'battle_allies.brawler_name': allies.map(b => b.name),
          'battle_allies.brawler_power': allies.map(b => b.power),
          'battle_allies.brawler_trophies': allies.map(b => b.trophies),
          /* battle enemies (nested) */
          'battle_enemies.brawler_id': enemies.map(b => b.id),
          'battle_enemies.brawler_name': enemies.map(b => b.name),
          'battle_enemies.brawler_power': enemies.map(b => b.power),
          'battle_enemies.brawler_trophies': enemies.map(b => b.trophies),
        }

        // to debug encoding errors:
        // console.log(require('@apla/clickhouse/src/process-db-value').encodeRow(record, (<any>stream).format))
        await new Promise<void>((resolve, reject) => {
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
    }

    battleStream.end()

    const brawlerInsertStart = performance.now()
    const brawlerStream = this.insert('INSERT INTO brawltime.brawler', (error) => {
      stats.timing('brawler.insert.timer', performance.now() - brawlerInsertStart)
      if (error) {
        stats.increment('brawler.insert.error')
        console.error(`error inserting brawler for ${player.tag} (${tagToId(player.tag)}): ${error}`)
      }
    })

    for (const brawler of player.brawlers) {
      stats.increment('brawler.insert.prepare')

      const record = {
        timestamp: formatClickhouseDate(new Date()),
        trophy_season_end: formatClickhouseDate(getSeasonEnd(new Date())),
        ...playerFacts,
        brawler_id: brawler.id,
        brawler_name: brawler.name,
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
        /* gears (nested) */
        'brawler_gears.id': brawler.gears.map(g => g.id),
        'brawler_gears.name': brawler.gears.map(g => g.name),
        'brawler_gears.level': brawler.gears.map(g => g.level),
        brawler_gears_length: brawler.gears.length,
      }

      await new Promise<void>((resolve, reject) => {
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
}
