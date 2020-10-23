import { Player as BrawlstarsPlayer, Event as BrawlstarsEvent, BattleLog, BattlePlayer, Club } from '../model/Brawlstars';
import { request, post } from '../lib/request';
import { xpToHours, brawlerId, capitalizeWords, capitalize } from '../lib/util';
import { MapMap, MapMetaMap } from '~/model/MetaEntry';
import { BrawlerMetaRow, MapMetaRow, LeaderboardRow, BrawlerStatisticsRows } from '~/model/Clicker';
import { Battle, Brawler, Player, BrawlerMetaStatistics, ActiveEvent, Leaderboard, LeaderboardEntry } from '~/model/Api';

const apiUnofficialUrl = process.env.BRAWLAPI_URL || 'https://api.starlist.pro/';
const apiOfficialUrl = process.env.BRAWLSTARS_URL || 'https://api.brawlstars.com/v1/';
const apiOfficialCnUrl = process.env.BRAWLSTARS_CN_URL || 'https://api.brawlstars.cn/v1/';
const clickerUrl = process.env.CLICKER_URL || '';
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

  /**
   * Return event meta information without actual Brawlers and win rates.
   */
  public async getAllEvents() {
    const meta = await this.getMapMeta({}, '0', '99')
    const metaData = {} as MapMap
    Object.entries(meta).forEach(([eventId, event]) => {
      metaData[eventId] = {
        mode: event.mode,
        map: event.map,
        sampleSize: event.sampleSize,
      };
    })
    return metaData
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

  public async getBrawlerMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    if (clickerUrl == '') {
      return [];
    }

    const meta = await request<BrawlerMetaRow[]>(
      '/meta/brawler',
      clickerUrl,
      'fetch_brawler_meta',
      { trophyrangeLower, trophyrangeHigher },
      {},
      60000,
    );

    const sumPicks = meta.reduce((sum, entry) => sum + entry.picks, 0);
    const sumPicksWeighted = meta.reduce((sum, entry) => sum + entry.picksWeighted, 0);
    return meta.map((entry) => ({
      id: brawlerId({ name: entry.brawlerName }),
      name: entry.brawlerName,
      sampleSize: entry.picks,
      stats: {
        winRate: entry.winRate,
        starRate: entry.starRate,
        pickRate: entry.picks / sumPicks,
        useRate: entry.picksWeighted / sumPicksWeighted,
      },
    }) as BrawlerMetaStatistics)
  }

  public async getBrawlerStatistics(id: string) {
    // name is validated by clicker
    if (clickerUrl == '') {
      return [];
    }

    return await request<BrawlerStatisticsRows>(
      '/brawler/' + id,
      clickerUrl,
      'fetch_brawler_statistics',
      {},
      {},
      60000,
    );
  }

  public async getMapMeta(filters: { [name: string]: string }, trophyrangeLower: string, trophyrangeHigher: string) {
    if (clickerUrl == '') {
      return {};
    }

    const meta = await request<MapMetaRow[]>(
      '/meta/map',
      clickerUrl,
      'fetch_map_meta',
      { trophyrangeLower, trophyrangeHigher },
      {},
      60000,
    );

    const mapTotalPicks = meta.reduce((mapTotalPicks, entry: MapMetaRow) => ({
      ...mapTotalPicks,
      [entry.id]: (mapTotalPicks[entry.id] || 0) + entry.picks,
    }), <{ [id: string]: number }>{});
    const mapTotalPicksWeighted = meta.reduce((mapTotalPicksWeighted, entry: MapMetaRow) => ({
      ...mapTotalPicksWeighted,
      [entry.id]: (mapTotalPicksWeighted[entry.id] || 0) + entry.picksWeighted,
    }), <{ [id: string]: number }>{});

    const nonNullStats = (entry: MapMetaRow) => {
      const stats = <{ [stat: string]: number }>{};
      stats.pickRate = entry.picks / mapTotalPicks[entry.id];
      stats.useRate = entry.picksWeighted / mapTotalPicksWeighted[entry.id];
      if (!!entry.rank && entry.rank > 0) {
        stats.rank = entry.rank;
      }
      if (!!entry.rank1Rate && entry.rank1Rate > 0) {
        stats.rank1Rate = entry.rank1Rate;
        stats.rank1 = Math.round(entry.rank1Rate * entry.picks);
      }
      if (!!entry.winRate && entry.winRate > 0) {
        stats.winRate = entry.winRate;
        stats.wins = Math.round(entry.winRate * entry.picks);
      }
      if (!!entry.duration && entry.duration > 0) {
        stats.duration = entry.duration;
      }
      if (!!entry.starRate && entry.starRate > 0) {
        stats.starRate = entry.starRate;
      }
      if (!!entry.level && entry.level > 0) {
        stats.level = entry.level;
      }

      if (entry.isBigbrawler) {
        return [...Object.entries(stats)]
          .reduce((stats, [prop, value]) => ({ ...stats, [prop + '_boss']: value }), {});
      }
      return stats;
    };

    const mapMeta = meta.reduce((mapMeta, entry: MapMetaRow) => ({
      ...mapMeta,
      [entry.id]: {
        mode: entry.mode,
        map: entry.map,
        sampleSize: mapTotalPicks[entry.id],
        brawlers: {
          ...((mapMeta[entry.id] || {}).brawlers || {}),
          [brawlerId({ name: entry.brawlerName })]: {
            name: capitalizeWords(entry.brawlerName.toLowerCase()),
            sampleSize: entry.picks,
            stats: {
              // boss has two records -> merge, boss stats get a suffix
              ...(((mapMeta[entry.id] || {}).brawlers || {})[brawlerId({ name: entry.brawlerName })] || {}).stats,
              ...nonNullStats(entry),
            }
          }
        }
      }
    }), <MapMetaMap>{});

    let filterIds = [] as string[];
    if (filters.current !== undefined || filters.upcoming !== undefined) {
      const events = await this.getActiveEvents();

      if (filters.current !== undefined) {
        const eventIds = events.current.map(({ id }) => id);
        filterIds = filterIds.concat(eventIds)
      }

      if (filters.upcoming !== undefined) {
        const eventIds = events.upcoming.map(({ id }) => id);
        filterIds = filterIds.concat(eventIds)
      }
    }

    if (filters.include !== undefined) {
      const eventIds = filters.include.split(',');
      filterIds = filterIds.concat(eventIds)
    }

    if (filterIds.length > 0) {
      Object.keys(mapMeta).forEach((eventId) => {
        if (!filterIds.includes(eventId)) {
          delete mapMeta[eventId];
        }
      });
    }

    if (filters.mode !== undefined) {
      const mode = filters.mode.toLowerCase()
        .replace(/ /g, '')
        .replace(/^showdown$/, 'soloshowdown');
      Object.entries(mapMeta).forEach(([eventId, event]) => {
        if (event.mode.toLowerCase().replace(/ /g, '') != mode) {
          delete mapMeta[eventId];
        }
      });
    }

    return mapMeta;
  }

  public async getPlayerStatistics(tag: string) {
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

    const battles = battleLog.items.map((battle) => {
      const transformPlayer = (player: BattlePlayer) => ({
        tag: player.tag.replace('#', ''),
        name: player.name,
        brawler: player.brawler.name === null ? 'nani' : brawlerId(player.brawler), // FIXME API bug reported 2020-06-06
        brawlerTrophies: player.brawler.trophies,
        isBigbrawler: battle.battle.bigBrawler === undefined ? false : battle.battle.bigBrawler.tag == player.tag,
      })

      let result = undefined as undefined|string;
      let victory = undefined as undefined|boolean;

      // TODO battle log database was cleared 2020-10-22,
      // all workarounds from before that date can be removed

      // FIXME since 2020-10-22, battle.event.mode is missing - patch it back
      // 2020-10-22, custom maps do not have the event attribute
      if (!('event' in battle) || battle.event == undefined) {
        battle.event = {}
      }
      battle.event.id = battle.event.id || 0
      battle.event.map = battle.event.map || ''
      // patch for backwards compatiblity
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
          victory = battle.battle.rank >= battle.battle.players.length / 2;
        }
        // duo
        if (battle.battle.teams) {
          victory = battle.battle.rank >= battle.battle.teams.length / 2;
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
        teams: teams.map(t => t.map(transformPlayer)),
      } as Battle
    }).sort((b1, b2) => (b2.timestamp as Date).valueOf() - (b1.timestamp as Date).valueOf());

    if (clickerUrl != '') {
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
