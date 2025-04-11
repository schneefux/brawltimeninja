import { brawlerId, capitalize, formatLeagueRanks, parseApiTime, unformatMode } from '../../lib/util'
import { Player as BrawlstarsPlayer, BattleLog, BattlePlayer, Club, BattlePlayerMultiple, PlayerRanking, ClubRanking, DevfoxPlayerResponse } from '../../model/Brawlstars'
import { Battle, Brawler, Player, ActiveEvent, ClubActivityStatistics, PlayerExtra, BrawlerExtra } from '../../model/Api'
import { request } from '../lib/request'
import { StarlistBrawler, StarlistEvent } from '../../model/Starlist'
import ClickerService from './ClickerService'
// curl https://api.brawlify.com/v1/brawlers | jq 'reduce .list[] as $item ({}; .[$item.id | tostring]=$item.name)'
import BrawlerNamesMap from '~/api/lib/brawler-names.json'
import { TRPCError } from '@trpc/server'
const BrawlerNames: Record<string, string> = BrawlerNamesMap
import { Cache } from '~/lib/cache'
import { hashCode } from '@schneefux/klicker/util'

const brawlapiUrl = process.env.BRAWLAPI_URL || 'https://api.brawlapi.com/v1/';
const brawlapiToken = process.env.BRAWLAPI_TOKEN || '';

const brawlstarsUrls = (process.env.BRAWLSTARS_URL || 'https://api.brawlstars.com/v1/').split(',');
const brawlstarsTokens = (process.env.BRAWLSTARS_TOKEN || '').split(',');

const devfoxUrl = process.env.HPDEVFOX_URL || 'https://api.hpdevfox.ru/';
const devfoxToken = process.env.HPDEVFOX_TOKEN || '';

const clickhouseUrl = process.env.CLICKHOUSE_URL
const twoMonths = 2*4*7*24*60*60*1000
const balanceChangesDate = new Date(Date.parse(process.env.BALANCE_CHANGES_DATE || '') || (Date.now() - twoMonths))

/*
// cn API is unavailable
const apiOfficialCnUrl = process.env.BRAWLSTARS_CN_URL || 'https://api.brawlstars.cn/v1/';
function getApiUrl(tag: string) {
  const playerId = tag
    .replace('#', '')
    .split('')
    .reduce((sum, c) => sum*BigInt(14) + BigInt('0289PYLQGRJCUV'.indexOf(c)), BigInt(0))
  const high = Number(playerId % BigInt(256))
  if (high >= 100) {
    // 100 - 111
    return apiOfficialCnUrl
  }
  // 0 - 23
  return apiOfficialUrl
}
*/

const BRAWLIFY_CACHE_MINUTES = 60 * 24

export default class BrawlstarsService {
  private readonly clicker?: ClickerService;
  private brawlifyCache = new Cache<string, Record<number, string>>(BRAWLIFY_CACHE_MINUTES)

  constructor() {
    if (clickhouseUrl != undefined) {
      this.clicker = new ClickerService(clickhouseUrl, balanceChangesDate);
    } else {
      console.warn('CLICKHOUSE_URL is not set, data storage will be unavailable')
    }
  }

  private async apiRequest<T>(path: string, metricName: string, timeout: number = 1000) {
    // perform hash-based load balancing between multiple API proxies based on path hash
    const index = Math.abs(hashCode(path)) % brawlstarsUrls.length
    const token = brawlstarsTokens[index] ?? brawlstarsTokens[0]
    return request<T>(path, brawlstarsUrls[index], metricName,
      {}, { 'Authorization': 'Bearer ' + token }, timeout)
  }

  // TODO official API does not show all future events as of 2022-01-07
  public async getActiveEvents() {
    const response = await request<{ active: StarlistEvent[], upcoming: StarlistEvent[] }>(
      'events',
      brawlapiUrl,
      'fetch_events',
      { },
      { 'Authorization': 'Bearer ' + brawlapiToken },
      1000,
    );

    const mapper = (events: StarlistEvent[]) => events.map((event) => ({
      id: event.map.id.toString(),
      map: event.map.name,
      mode: unformatMode(event.map.gameMode.name),
      start: event.startTime,
      end: event.endTime,
    }) as ActiveEvent);
    return {
      current: mapper(response.active),
      upcoming: mapper(response.upcoming),
    }
  }

  public async getPlayerRanking(countryCode: string) {
    const response = await this.apiRequest<{ items: PlayerRanking[] }>(`rankings/${countryCode}/players`, 'fetch_player_rankings')
    response.items.forEach(i => {
      if (i.trophies == 1) {
        // FIXME 2023-12-13: players above 100k trophies return '1'
        i.trophies = 100000
      }
    })
    return response.items
  }

  public async getClubRanking(countryCode: string) {
    const response = await this.apiRequest<{ items: ClubRanking[] }>(`rankings/${countryCode}/clubs`, 'fetch_club_rankings')
    return response.items
  }

  public async getBrawlerRanking(countryCode: string, brawlerId: number) {
    const response = await this.apiRequest<{ items: PlayerRanking[] }>(`rankings/${countryCode}/brawlers/${brawlerId}`, 'fetch_brawler_rankings')
    return response.items
  }

  private async getPlayer(tag: string): Promise<BrawlstarsPlayer> {
    return this.apiRequest<BrawlstarsPlayer>(
      'players/%23' + tag,
      'fetch_player',
    );
  }

  private async getPlayerDevfox(tag: string): Promise<DevfoxPlayerResponse> {
    return request<DevfoxPlayerResponse>(
      'profile/' + tag + (devfoxToken ? '?api_key=' + devfoxToken : ''),
      devfoxUrl,
      'fetch_player_devfox',
      { },
      { },
      1000,
    );
  }

  private async getBrawlerMeta(): Promise<Record<number, string>> {
    // TODO move caches to mariadb

    return this.brawlifyCache.getOrUpdate('brawlers', async () => {
      const response = await request<{ list: StarlistBrawler[] }>(
        'brawlers',
        brawlapiUrl,
        'fetch_brawlers',
        { },
        { 'Authorization': 'Bearer ' + brawlapiToken },
        1000,
      );
      return Object.fromEntries(response.list.map(b => [b.id, b.name]))
    });
  }

  private async getPlayerBattleLog(tag: string): Promise<BattleLog> {
    return this.apiRequest<BattleLog>(
      'players/%23' + tag + '/battlelog',
      'fetch_player_battles',
    )
  }

  private transformBattle(b: BattleLog['items'][0]): Battle {
    const isRanked = b.battle.type == 'soloRanked' || b.battle.type == 'teamRanked'

    b.battle.teams?.forEach(t => {
      t.forEach(p => {
        // FIXME API bug 2022-07-11, brawler trophies may be -1
        if (p.brawler.trophies == -1) {
          p.brawler.trophies = undefined
        }

        // FIXME API bug 2022-12-20, brawler power may be -1
        if (p.brawler.power == -1) {
          p.brawler.power = 0 // probably not correct
        }

        // FIXME API bug 2024-06-26, Brawler names are null
        p.brawler.name = p.brawler.name || BrawlerNames[p.brawler.id].toUpperCase()
        // FIXME API bug 2022-07-11, 'Colonel\nRuffs'
        p.brawler.name = p.brawler.name.replace(/\s/g, ' ')
      })
    })

    if (b.battle.starPlayer != undefined) {
      // FIXME API bug 2022-07-11, brawler trophies may be -1
      if (b.battle.starPlayer.brawler.trophies == -1) {
        b.battle.starPlayer.brawler.trophies = undefined
      }

      // FIXME API bug 2022-12-20, brawler power may be -1
      if (b.battle.starPlayer.brawler.power == -1) {
        b.battle.starPlayer.brawler.power = 0 // probably not correct
      }

      // FIXME API bug 2024-06-26, Brawler names are null
      b.battle.starPlayer.brawler.name = b.battle.starPlayer.brawler.name || BrawlerNames[b.battle.starPlayer.brawler.id].toUpperCase()
      // FIXME API bug 2022-07-11, 'Colonel\nRuffs'
      b.battle.starPlayer.brawler.name = b.battle.starPlayer.brawler.name.replace(/\s/g, ' ')
    }

    b.battle.players?.forEach((p: BattlePlayer | BattlePlayerMultiple) => {
      if ('brawler' in p) {
        // FIXME API bug 2024-06-26, Brawler names are null
        p.brawler.name = p.brawler.name || BrawlerNames[p.brawler.id].toUpperCase()
        // FIXME API bug 2022-07-11, 'Colonel\nRuffs'
        p.brawler.name = p.brawler.name.replace(/\s/g, ' ')
      }
      if ('brawlers' in p) {
        // FIXME API bug 2024-06-26, Bralwer names are null
        p.brawlers.forEach(b => b.name = b.name || BrawlerNames[b.id].toUpperCase())
        // FIXME API bug 2022-07-11, 'Colonel\nRuffs'
        p.brawlers.forEach(b => b.name = b.name.replace(/\s/g, ' '))
      }
    })

    const transformPlayer = (player: BattlePlayer|BattlePlayerMultiple) => {
      const transformBrawler = (brawler: BattlePlayer['brawler'] | BattlePlayerMultiple['brawlers'][0]) => ({
        tag: player.tag.replace('#', ''),
        name: player.name,
        brawler: brawlerId(brawler),
        brawlerTrophies: brawler.trophies,
        // 2024: For ranked games, brawler.trophies is the rank
        brawlerRank: isRanked && brawler.trophies != undefined ? formatLeagueRanks(brawler.trophies) : undefined,
        isBigbrawler: b.battle.bigBrawler === undefined ? false : b.battle.bigBrawler.tag == player.tag,
      })

      if ('brawler' in player) {
        return [transformBrawler(player.brawler)]
      }
      if ('brawlers' in player) {
        return player.brawlers.map(brawler => transformBrawler(brawler))
      }
      return []
    }

    let result = undefined as undefined|string;
    let victory = undefined as undefined|boolean;

    // TODO battle log database was cleared 2020-10-22,
    // all workarounds from before that date can be removed

    // 2020-10-22, competition maps: event={id: 0, map: null}
    if (b.event.id == 0 && b.event.map == null) {
      // TODO detect competition winner based on mode rotation
      b.event.map = 'Competition Entry'
    }

    b.event.id = b.event.id || 0
    b.event.map = b.event.map || ''
    // FIXME since 2020-10-22, battle.event.mode is missing - patch it back
    // FIXME since 2022-01, battle.event.mode may be "unknown"
    if (b.event.mode == undefined || b.event.mode == 'unknown') {
      // FIXME since 2025-03-18:
      //  * battle.event.mode=unknown && battle.battle.mode=brawlBall: Brawl Hockey (special Brawl Ball mode)
      //  * battle.event.mode=brawlBall && battle.battle.mode=brawlBall: Brawl Ball
      if (b.battle.mode == 'brawlBall') {
        b.event.mode = 'brawlHockey';
      } else {
        b.event.mode = b.battle.mode
      }
    }

    // FIXME API bug 2020-07-26
    if (['roboRumble', 'bigGame'].includes(b.event.mode) && b.battle.result == undefined) {
      // 'duration' is 1 (loss) or N/A (win)
      b.battle.result = b.battle.duration == undefined ? 'victory' : 'defeat'
      delete b.battle.duration
    }

    if (b.battle.duration !== undefined) {
      // bossfight, gem grab, ...
      const minutes = Math.floor(b.battle.duration / 60);
      const seconds = b.battle.duration % 60;
      result = `${minutes}m ${seconds}s`;
    }
    if (b.battle.result !== undefined) {
      // 3v3
      result = capitalize(b.battle.result);
      victory = b.battle.result == 'victory'
    }
    if (b.battle.rank !== undefined) {
      // showdown
      result = `Rank ${b.battle.rank}`;
      // solo
      if (b.battle.players) {
        victory = b.battle.rank <= b.battle.players.length / 2;
      }
      // duo
      if (b.battle.teams) {
        victory = b.battle.rank <= b.battle.teams.length / 2;
      }
    }

    const teamsWithoutBigBrawler = (b.battle.teams !== undefined ? b.battle.teams : b.battle.players!.map((p) => [p]));
    const teams = b.battle.bigBrawler !== undefined ? teamsWithoutBigBrawler.concat([[b.battle.bigBrawler]]) : teamsWithoutBigBrawler;

    return {
      timestamp: parseApiTime(b.battleTime),
      ranked: isRanked,
      event: b.event,
      result,
      victory,
      trophyChange: b.battle.trophyChange,
      teams: teams.map(t => t.flatMap(t => transformPlayer(t))),
    } as Battle
  }

  public async getPlayerStatistics(tag: string, store: boolean, skipBattlelog = false): Promise<Player> {
    const battleLogDummy: BattleLog = {
      items: [],
      paging: [],
    }

    const battleLog = skipBattlelog ? battleLogDummy : await this.getPlayerBattleLog(tag).catch(() => battleLogDummy);

    // fetch player after battle log to prevent race condition
    // where a brawler is used in battle log,
    // but not available in player.brawlers yet
    const player = await this.getPlayer(tag);

    // FIXME API bug 2022-03-15, payload has no battle
    const battles = battleLog.items.filter(b => b.battle != undefined).map(b => this.transformBattle(b));

    player.brawlers.forEach(b => {
      // FIXME API bug 2024-06-26, Bralwer names are null
      b.name = b.name || BrawlerNames[b.id].toUpperCase()
      // FIXME API bug 2022-07-11, 'Colonel\nRuffs'
      b.name = b.name.replace(/\s/g, ' ')
    })

    if (store && this.clicker && battleLog.items.length > 0) {
      console.log('store battles for ' + tag)
      // do not await - process in background and resolve early
      this.clicker.store({ player, battleLog })
        .catch(err => console.error('error inserting battles for ' + tag, err))
    }

    const brawlers: Record<string, Brawler> = Object.fromEntries(player.brawlers.map(b => [brawlerId(b), b]))

    // 2024-12-17: name colors have an alpha channel, cut it off
    player.nameColor = '#' + (player.nameColor?.replace(/^0x/, '') ?? 'ffffff').slice(-6)

    return {
      ...player,
      // overwrite brawlers
      brawlers,
      battles,
    };
  }

  public async getPlayerExtraStatistics(tag: string): Promise<PlayerExtra> {
    const brawlerMap = await this.getBrawlerMeta()
    const devfoxResponse = await this.getPlayerDevfox(tag)

    if (devfoxResponse.state != 0) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Error from devfox API',
      })
    }

    const brawlers: Record<string, BrawlerExtra> = Object.fromEntries(
      devfoxResponse.response.Heroes.map(b => [
        brawlerId({ name: brawlerMap[b.Character] }),
        {
          masteryPoints: b.Mastery,
        }
      ])
    )

    const rankPoints = devfoxResponse.response.Stats[24]
    const highestRankPoints = devfoxResponse.response.Stats[25]

    return {
      rank: {
        points: rankPoints,
        ...formatLeagueRanks(Math.floor(rankPoints / 500 + 1)),
      },
      highestRank: {
        points: highestRankPoints,
        ...formatLeagueRanks(Math.floor(highestRankPoints / 500 + 1)),
      },
      accountCreationYear: devfoxResponse.response.Stats[27],
      brawlers,
    }
  }

  public async getClubStatistics(tag: string) {
    const club = await this.apiRequest<Club>(
      'clubs/%23' + tag,
      'fetch_club',
    )
    // official API: with hash, unofficial API: no hash
    // brawltime assumes no hash
    club.tag = club.tag.replace(/^#/, '')
    club.members.forEach(m => m.tag = m.tag.replace(/^#/, ''))
    return club
  }

  public async getClubActivityStatistics(tags: string[]): Promise<ClubActivityStatistics> {
    // tags without hash

    const lastActive: Record<string, Date> = {}
    const commonBattlesMap: Record<string, Battle> = {}
    const battlesByMode: Record<string, number> = {}

    for (let tag of tags) {
      const battleData = await this.getPlayerBattleLog(tag).catch(() => ({ items: [] }))
      const battles = battleData.items.map(b => this.transformBattle(b))

      // sort descending
      const timestamps = battles.map(b => b.timestamp).sort((a, b) => b.valueOf() - a.valueOf())
      lastActive[tag] = timestamps[0]

      battles.forEach(b => {
        const battleTags = b.teams.flatMap(t => t.map(p => p.tag))
        const commonTagsLength = tags.filter(t => battleTags.includes(t)).length
        if (commonTagsLength > 1) {
          commonBattlesMap[b.timestamp.toISOString()] = b
        }

        if (!(b.event.mode in battlesByMode)) {
          battlesByMode[b.event.mode] = 0
        }
        battlesByMode[b.event.mode]++
      })
    }

    const commonBattles = [...Object.values(commonBattlesMap)]
      .sort((b1, b2) => b2.timestamp.valueOf() - b1.timestamp.valueOf())

    return {
      lastActive,
      commonBattles,
      battlesByMode,
    }
  }
}
