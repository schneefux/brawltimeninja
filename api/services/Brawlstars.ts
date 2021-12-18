import { parseApiTime, xpToHours, brawlerId, capitalize, getCompetitionMapDayStart, getCompetitionWinnerMode } from '../lib/util.js';
import { Player as BrawlstarsPlayer, Event as BrawlstarsEvent, BattleLog, BattlePlayer, Club } from '../model/Brawlstars.js';
import { Battle, Brawler, Player, ActiveEvent, Leaderboard, LeaderboardEntry } from '../model/Api.js';
import { LeaderboardRow } from '../model/Clicker.js';
import { request, post } from '../lib/request.js';

const apiUnofficialUrl = process.env.BRAWLAPI_URL || 'https://api.brawlify.com/';
const apiOfficialUrl = process.env.BRAWLSTARS_URL || 'https://api.brawlstars.com/v1/';
const apiOfficialCnUrl = process.env.BRAWLSTARS_CN_URL || 'https://api.brawlstars.cn/v1/';
const clickerUrl = process.env.CLICKER_URL || '';
const clickerUrl2 = process.env.CLICKER_URL2 || '';
const tokenUnofficial = process.env.BRAWLAPI_TOKEN || '';
const tokenOfficial = process.env.BRAWLSTARS_TOKEN || '';

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

export default class BrawlstarsService {
  private readonly apiUnofficial = apiUnofficialUrl;
  private readonly apiOfficial = apiOfficialUrl;

  public async getActiveEvents() {
    const response = await request<{ active: BrawlstarsEvent[], upcoming: BrawlstarsEvent[] }>(
      'events',
      this.apiUnofficial,
      'fetch_events',
      { },
      { 'Authorization': 'Bearer ' + tokenUnofficial },
      1000,
    );

    const mapper = (events: BrawlstarsEvent[]) => events.map((event) => ({
      id: event.map.id.toString(),
      map: event.map.name,
      mode: event.map.gameMode.name,
      start: event.startTime,
      end: event.endTime,
    }) as ActiveEvent);
    return {
      current: mapper(response.active),
      upcoming: mapper(response.upcoming),
    }
  }

  public async getLeaderboard(metric: string): Promise<Leaderboard> {
    let entries = [] as LeaderboardEntry[]

    if (metric == 'trophies') {
      const response = await request<any>('rankings/global/players',
        this.apiOfficial,
        'fetch_trophies_leaderboard',
        { },
        { 'Authorization': 'Bearer ' + tokenOfficial },
        10000,
      );

      entries = response.items.map((d: any) => ({
        tag: d.tag.replace(/^#/, ''),
        name: d.name,
        icon: d.icon.id,
        metric: d.trophies,
      }));
    }

    if (metric == 'powerPlayPoints') {
      const response = await request<any>('rankings/global/powerplay/seasons/latest',
        this.apiOfficial,
        'fetch_powerplay_leaderboard',
        { },
        { 'Authorization': 'Bearer ' + tokenOfficial },
        10000,
      );

      entries = response.items.map((d: any) => ({
        tag: d.tag.replace(/^#/, ''),
        name: d.name,
        icon: d.icon.id,
        metric: d.trophies,
      }));
    }

    if (metric == 'hours' && clickerUrl != '') {
      const response = await request<LeaderboardRow[]>(
        '/top/expPoints',
        clickerUrl,
        'fetch_leaderboard',
        {},
        {},
        60000,
      );

      entries = response.map(entry => ({
        name: entry.name,
        tag: entry.tag,
        icon: entry.icon,
        metric: xpToHours(entry.expPoints),
      }));
    }

    if (entries.length == 0 && clickerUrl != '') {
      const response = await request<LeaderboardRow[]>(
        '/top/' + metric,
        clickerUrl,
        'fetch_leaderboard_' + metric,
        {},
        {},
        60000,
      );

      entries = response.map(entry => ({
        name: entry.name,
        tag: entry.tag,
        icon: entry.icon,
        metric: entry[metric as keyof LeaderboardRow] as number,
      }));
    }

    return {
      metric,
      entries,
    };
  }

  public async getPlayerStatistics(tag: string, store: boolean) {
    const battleLog = await request<BattleLog>(
      'players/%23' + tag + '/battlelog',
      getApiUrl(tag),
      'fetch_player_battles',
      { },
      { 'Authorization': 'Bearer ' + tokenOfficial },
      1000,
    ).catch(() => <BattleLog>({
      items: [],
      paging: [],
    }));

    // fetch player after battle log to prevent race condition
    // where a brawler is used in battle log,
    // but not available in player.brawlers yet
    const player = await request<BrawlstarsPlayer>(
      'players/%23' + tag,
      getApiUrl(tag),
      'fetch_player',
      { },
      { 'Authorization': 'Bearer ' + tokenOfficial },
      1000,
    );

    // official API: with hash, unofficial API: no hash
    // brawltime assumes no hash
    player.tag = player.tag.replace(/^#/, '');
    if (player.club?.tag != undefined) {
      player.club.tag = player.club.tag.replace(/^#/, '');
    }

    const battles = battleLog.items.map((battle) => {
      const transformPlayer = (player: BattlePlayer) => {
        if ('brawler' in player) {
          return [{
            tag: player.tag.replace('#', ''),
            name: player.name,
            brawler: brawlerId(player.brawler),
            brawlerTrophies: player.brawler.trophies,
            isBigbrawler: battle.battle.bigBrawler === undefined ? false : battle.battle.bigBrawler.tag == player.tag,
          }]
        }
        if ('brawlers' in player) {
          return player.brawlers.map(brawler => ({
            tag: player.tag.replace('#', ''),
            name: player.name,
            brawler: brawlerId(brawler),
            brawlerTrophies: brawler.trophies,
            isBigbrawler: battle.battle.bigBrawler === undefined ? false : battle.battle.bigBrawler.tag == player.tag,
          }))
        }
        return []
      }

      let result = undefined as undefined|string;
      let victory = undefined as undefined|boolean;

      // TODO battle log database was cleared 2020-10-22,
      // all workarounds from before that date can be removed

      // 2020-10-22, competition maps: event={id: 0, map: null}
      if (battle.event.id == 0 && battle.event.map == null) {
        const battleTime = parseApiTime(battle.battleTime)
        const competitionWinnerMode = getCompetitionWinnerMode(battleTime)
        if (battle.battle.mode == competitionWinnerMode) {
          battle.event.map = `Competition Winner ${getCompetitionMapDayStart(parseApiTime(battle.battleTime)).toISOString().slice(0, 10)}`
        } else {
          battle.event.map = 'Competition Entry'
        }
      }

      battle.event.id = battle.event.id || 0
      battle.event.map = battle.event.map || ''
      // FIXME since 2020-10-22, battle.event.mode is missing - patch it back
      battle.event.mode = battle.event.mode || battle.battle.mode

      // FIXME API bug 2020-07-26
      if (['roboRumble', 'bigGame'].includes(battle.event.mode) && battle.battle.result == undefined) {
        // 'duration' is 1 (loss) or N/A (win)
        battle.battle.result = battle.battle.duration == undefined ? 'victory' : 'defeat'
        delete battle.battle.duration
      }

      if (battle.battle.duration !== undefined) {
        // bossfight, gem grab, ...
        const minutes = Math.floor(battle.battle.duration / 60);
        const seconds = battle.battle.duration % 60;
        result = `${minutes}m ${seconds}s`;
      }
      if (battle.battle.result !== undefined) {
        // 3v3
        result = capitalize(battle.battle.result);
        victory = battle.battle.result == 'victory'
      }
      if (battle.battle.rank !== undefined) {
        // showdown
        result = `Rank ${battle.battle.rank}`;
        // solo
        if (battle.battle.players) {
          victory = battle.battle.rank <= battle.battle.players.length / 2;
        }
        // duo
        if (battle.battle.teams) {
          victory = battle.battle.rank <= battle.battle.teams.length / 2;
        }
      }

      const time = battle.battleTime;
      const isoDate = `${time.slice(0, 4)}-${time.slice(4, 6)}-${time.slice(6, 8)}T${time.slice(9, 11)}:${time.slice(11, 13)}:${time.slice(13)}`;

      const teamsWithoutBigBrawler = (battle.battle.teams !== undefined ? battle.battle.teams : battle.battle.players!.map((p) => [p]));
      const teams = battle.battle.bigBrawler !== undefined ? teamsWithoutBigBrawler.concat([[battle.battle.bigBrawler]]) : teamsWithoutBigBrawler;

      return {
        timestamp: new Date(Date.parse(isoDate)),
        event: battle.event,
        result,
        victory,
        trophyChange: battle.battle.trophyChange,
        teams: teams.map(t => t.flatMap(t => transformPlayer(t))),
      } as Battle
    }).sort((b1, b2) => (b2.timestamp as Date).valueOf() - (b1.timestamp as Date).valueOf());

    if (clickerUrl != '' && store) {
      console.time('post battles to clicker ' + tag)
      // do not await - process in background and resolve early
      post<null>(
        clickerUrl + '/track',
        { player, battleLog },
        'upload_battlelog_clicker',
        5000)
        .catch(error => console.error(error, tag))
        .finally(() => console.timeEnd('post battles to clicker ' + tag));
    }

    if (clickerUrl2 != '' && store) {
      console.time('post battles to clicker 2 ' + tag)
      // do not await - process in background and resolve early
      post<null>(
        clickerUrl2 + '/track',
        { player, battleLog },
        'upload_battlelog_clicker2',
        5000)
        .catch(error => console.error(error, tag))
        .finally(() => console.timeEnd('post battles to clicker 2 ' + tag));
    }

    const brawlers = player.brawlers
      .sort((b1, b2) => b2.trophies - b1.trophies)
      .reduce((brawlers, brawler) => ({
        ...brawlers,
        [brawler.name === null ? 'nani' : brawlerId(brawler)]: { // FIXME
          ...brawler,
          name: brawler.name || 'NANI', // FIXME API bug 2020-06-06
        } as Brawler,
      }), {} as Record<string, Brawler>);

    const hoursSpent = xpToHours(player.expPoints);

    return {
      ...player,
      hoursSpent,
      // overwrite brawlers
      brawlers,
      battles,
    } as Player;
  }

  public async getClubStatistics(tag: string) {
    const club = await request<Club>(
      'clubs/%23' + tag,
      getApiUrl(tag),
      'fetch_club',
      { },
      { 'Authorization': 'Bearer ' + tokenOfficial },
      1000,
    )
    // official API: with hash, unofficial API: no hash
    // brawltime assumes no hash
    club.tag = club.tag.replace(/^#/, '')
    club.members.forEach(m => m.tag = m.tag.replace(/^#/, ''))
    return club
  }
}
