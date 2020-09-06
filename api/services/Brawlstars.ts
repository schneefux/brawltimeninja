import { Player as BrawlstarsPlayer, Event as BrawlstarsEvent, BattleLog, BattlePlayer } from '../model/Brawlstars';
import History from '../model/History';
import { request, post } from '../lib/request';
import { xpToHours, brawlerId, capitalizeWords, capitalize } from '../lib/util';
import { MapMap, MapMetaMap, ModeMetaMap } from '~/model/MetaEntry';
import { StarpowerMetaRow, GadgetMetaRow, BrawlerMetaRow, ModeMetaRow, MapMetaRow, BattleMeasures, PlayerWinRatesRows, LeaderboardRow, BrawlerStatisticsRows } from '~/model/Clicker';
import { PlayerWinrates, Battle, Brawler, Statistic, Mode, Player, BrawlerMetaStatistics, StarpowerMetaStatistics, GadgetMetaStatistics, ActiveEvent } from '~/model/Api';

const apiUnofficialUrl = process.env.BRAWLAPI_URL || 'https://api.starlist.pro/';
const apiOfficialUrl = process.env.BRAWLSTARS_URL || 'https://api.brawlstars.com/v1/';
const apiOfficialCnUrl = process.env.BRAWLSTARS_CN_URL || 'https://api.brawlstars.cn/v1/';
const trackerUrl = process.env.TRACKER_URL || '';
const clickerUrl = process.env.CLICKER_URL || '';
const tokenUnofficial = process.env.BRAWLAPI_TOKEN || '';
const tokenOfficial = process.env.BRAWLSTARS_TOKEN || '';

const pluckBattleMeasures = (row: BattleMeasures) => ({
  timestamp: row.timestamp,
  picks: row.picks,
  duration: row.duration,
  rank: row.rank,
  rank1Rate: row.rank1Rate,
  winRate: row.winRate,
  starRate: row.starRate,
  level: row.level,
  trophyChange: row.trophyChange,
} as BattleMeasures)

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

  public async getHoursLeaderboard() {
    if (clickerUrl == '') {
      return [];
    }

    const response = await request<LeaderboardRow[]>(
      '/top/exp',
      clickerUrl,
      'fetch_leaderboard',
      {},
      {},
      60000,
    );

    return response.map(entry => ({
      name: entry.playerName,
      tag: entry.playerTag,
      hours: xpToHours(entry.expPoints),
    }));
  }

  public async getTrophiesLeaderboard() {
    const response = await request<any>('rankings/global/players',
      this.apiOfficial,
      'fetch_trophies_leaderboard',
      { },
      { 'Authorization': 'Bearer ' + tokenOfficial },
      10000,
    );
    return response.items.map((d: any) => ({
      tag: d.tag.replace(/^#/, ''),
      name: d.name,
      trophies: d.trophies,
    }));
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

  public async getStarpowerMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    if (clickerUrl == '') {
      return [];
    }

    const meta = await request<StarpowerMetaRow[]>(
      '/meta/starpower',
      clickerUrl,
      'fetch_starpower_meta',
      { trophyrangeLower, trophyrangeHigher },
      {},
      60000,
    );

    return meta.map((entry) => ({
      id: entry.starpowerId || (<any>entry).id,
      brawlerName: brawlerId({ name: entry.brawlerName }),
      brawlerId: entry.brawlerId,
      starpowerName: entry.starpowerName,
      sampleSize: entry.picks,
      stats: {
        winRate: entry.winRate,
        starRate: entry.starRate,
        rank1Rate: entry.rank1Rate,
      },
    }) as StarpowerMetaStatistics)
  }

  public async getGadgetMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    if (clickerUrl == '') {
      return [];
    }

    const meta = await request<GadgetMetaRow[]>(
      '/meta/gadget',
      clickerUrl,
      'fetch_gadget_meta',
      { trophyrangeLower, trophyrangeHigher },
      {},
      60000,
    );

    return meta.map((entry) => ({
      id: entry.gadgetId || (<any>entry).id,
      brawlerName: brawlerId({ name: entry.brawlerName }),
      brawlerId: entry.brawlerId,
      gadgetName: entry.gadgetName,
      sampleSize: entry.picks,
      stats: {
        winRate: entry.winRate,
        starRate: entry.starRate,
        rank1Rate: entry.rank1Rate,
      },
    }) as GadgetMetaStatistics)
  }

  public async getModeMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    if (clickerUrl == '') {
      return [];
    }

    const meta = await request<ModeMetaRow[]>(
      '/meta/mode',
      clickerUrl,
      'fetch_mode_meta',
      { trophyrangeLower, trophyrangeHigher },
      {},
      60000,
    );

    const modeTotalPicks = meta.reduce((modeTotalPicks, entry: ModeMetaRow) => ({
      ...modeTotalPicks,
      [entry.mode]: (modeTotalPicks[entry.mode] || 0) + entry.picks,
    }), <{ [id: string]: number }>{});
    const modeTotalPicksWeighted = meta.reduce((modeTotalPicksWeighted, entry: ModeMetaRow) => ({
      ...modeTotalPicksWeighted,
      [entry.mode]: (modeTotalPicksWeighted[entry.mode] || 0) + entry.picksWeighted,
    }), <{ [id: string]: number }>{});

    const nonNullStats = (entry: ModeMetaRow) => {
      const stats = <{ [stat: string]: number }>{};
      if (!!entry.winRate && entry.winRate > 0) {
        stats.winRate = entry.winRate;
      }
      if (!!entry.rank && entry.rank > 0) {
        stats.rank = entry.rank;
      }
      if (!!entry.duration && entry.duration > 0) {
        stats.duration = entry.duration;
      }
      stats.pickRate = entry.picks / modeTotalPicks[entry.mode];
      stats.useRate = entry.picksWeighted / modeTotalPicksWeighted[entry.mode];
      if (!!entry.starRate && entry.starRate > 0) {
        stats.starRate = entry.starRate;
      }
      if (!!entry.rank1Rate && entry.rank1Rate > 0) {
        stats.rank1Rate = entry.rank1Rate;
      }
      return stats;
    };

    const modeMeta = meta.reduce((modeMeta, entry: ModeMetaRow) => ({
      ...modeMeta,
      [entry.mode]: {
        mode: entry.mode,
        sampleSize: modeTotalPicks[entry.mode],
        brawlers: {
          ...((modeMeta[entry.mode] || {}).brawlers || {}),
          [brawlerId({ name: entry.brawlerName })]: {
            name: capitalizeWords(entry.brawlerName.toLowerCase()),
            sampleSize: entry.picks,
            stats: nonNullStats(entry),
          }
        }
      }
    }), <ModeMetaMap>{});

    return modeMeta;
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

  public async getPlayerWinrates(tag: string) {
    tag = tag.replace(/^#/, '');

    let data: PlayerWinRatesRows = { mode: [], brawler: [], total: [] };
    if (clickerUrl != '') {
      console.time('get winrates from clicker ' + tag);
      data = await request<PlayerWinRatesRows>(
        `/winrates/${tag}`,
        clickerUrl,
        'fetch_player_winrates',
        {},
        {},
        10000
      );
      console.timeEnd('get winrates from clicker ' + tag);
    }

    const winrates = { brawler: {}, mode: {}, total: {} } as PlayerWinrates;
    data.brawler.forEach(b =>
      winrates.brawler[b.brawlerId] = {
        name: b.brawlerName,
        stats: pluckBattleMeasures(b),
      })
    data.mode.forEach(m =>
      winrates.mode[m.mode] = {
        name: m.mode,
        stats: pluckBattleMeasures(m),
      })
    data.total.forEach(t => winrates.total = { stats: pluckBattleMeasures(t) })

    return {
      winrates
    }
  }

  public async getPlayerHistory(tag: string) {
    tag = tag.replace(/^#/, '');

    let history: History = { playerHistory: [], brawlerHistory: [] };
    if (trackerUrl != '') {
      console.time('get history from tracker ' + tag);
      history = await request<History>(
        `/history/${tag}`,
        trackerUrl,
        'fetch_player_history',
        {},
        {},
        10000
      );
      console.timeEnd('get history from tracker ' + tag);
    }

    interface BrawlerHistoryEntry {
      timestamp: Date|string
      trophies: number
    }
    history.brawlerHistory.forEach((b) => b.name = brawlerId(b))
    const brawlers = history.brawlerHistory.reduce((brawlers, entry) => ({
      ...brawlers,
      [entry.name]: {
        history: [...(brawlers[entry.name]?.history || [] as BrawlerHistoryEntry[]), {
          timestamp: entry.timestamp,
          trophies: entry.trophies,
        }]
      },
    }), {} as { [id: string]: { history: BrawlerHistoryEntry[] } })

    return {
      history: history.playerHistory,
      brawlers,
    };
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

      // FIXME API bug 2020-07-26
      if (battle.event.mode == 'roboRumble' && battle.battle.result == undefined) {
        // 'duration' is 1 (loss) or N/A (win)
        victory = !('duration' in battle.battle)
        result = victory ? 'Victory' : 'Defeat'
        delete battle.battle.duration
      }

      return {
        timestamp: new Date(Date.parse(isoDate)),
        event: {
          id: battle.event.id,
          mode: battle.event.mode,
          map: battle.event.map,
        },
        result,
        victory,
        trophyChange: battle.battle.trophyChange,
        teams: teams.map(t => t.map(transformPlayer)),
      } as Battle
    }).sort((b1, b2) => (b2.timestamp as Date).valueOf() - (b1.timestamp as Date).valueOf());

    if (trackerUrl != '') {
      console.time('post battles to tracker ' + tag)
      // do not await - process in background and resolve early
      post<null>(
        trackerUrl + '/track',
        { player, battleLog },
        'upload_battlelog',
        5000)
        .catch(error => console.error(error, tag))
        .finally(() => console.timeEnd('post battles to tracker ' + tag));
    }

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

    const brawlers = {} as { [id: string]: Brawler };
    player.brawlers
      .sort((b1, b2) => b2.trophies - b1.trophies)
      .forEach((brawler) => {
        brawlers[brawler.name === null ? 'nani' : brawlerId(brawler)] = { // FIXME
          name: brawler.name || 'NANI', // FIXME API bug 2020-06-06
          rank: brawler.rank,
          trophies: brawler.trophies,
          highestTrophies: brawler.highestTrophies,
          power: brawler.power,
          history: [],
        } as Brawler;
      });

    const hoursSpent = xpToHours(player.expPoints);

    const avgProp = <K extends string>(prop: K) => <T extends Record<K, any>>(arr: T[]) => arr
      .map((o) => o[prop])
      .reduce((agg, cur) => agg + cur, 0)
      / arr.length;

    const heroStats = {
      averageVictories: {
        label: 'Average 3v3 Victories',
        value: Math.floor(player["3vs3Victories"] / player.brawlers.length)
      },
      averageTrophies: {
        label: 'Average Trophies',
        value: Math.floor(avgProp('trophies')(player.brawlers))
      },
      averageRank: {
        label: 'Average Rank',
        value: Math.floor(avgProp('rank')(player.brawlers))
      },
      averagePower: {
        label: 'Average Power Level',
        value: Math.floor(avgProp('power')(player.brawlers))
      },
    } as { [id: string]: Statistic };

    const data = {
      tag: player.tag,
      name: player.name,
      hoursSpent,
      trophies: player.trophies,
      clubName: player.club === null ? '' : player.club!.name,
      qualifiedFromChampionshipChallenge: player.isQualifiedFromChampionshipChallenge,
      history: [], // filled by /history
      winrates: {}, // filled by /winrates
      stats: {
        trophies: player.trophies,
        highestTrophies: player.highestTrophies,
        powerPlayPoints: player.powerPlayPoints,
        highestPowerPlayPoints: player.highestPowerPlayPoints,
        expLevel: player.expLevel,
        victories: player['3vs3Victories'],
        soloVictories: player.soloVictories,
        duoVictories: player.duoVictories,
      },
      brawlers,
      heroStats,
      battles,
      modes: {
        'showdown': {
          label: 'Showdown',
          icon: 'showdown_optimized.png',
          background: 'showdown.jpg',
          stats: {
            victories: {
              label: 'Solo Victories',
              value: player.soloVictories,
            },
            duoVictories: {
              label: 'Duo Victories',
              value: player.duoVictories,
            },
          }
        } as Mode,
        '3v3': {
          label: 'All 3v3',
          icon: 'gemgrab_optimized.png',
          background: 'gemgrab.jpg',
          stats: {
            victories: {
              label: 'Victories',
              value: player['3vs3Victories'],
            },
          }
        } as Mode,
      },
    } as Player;

    return data;
  }
}
