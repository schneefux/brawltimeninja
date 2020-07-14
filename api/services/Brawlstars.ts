import { Player as BrawlstarsPlayer, Event as BrawlstarsEvent, BattleLog, BattlePlayer, ActiveEvent } from '../model/Brawlstars';
import { Brawler, PlayerStatistic, Mode, Player, Battle } from '../model/Player';
import { LeaderboardEntry } from '../model/Leaderboard';
import History from '../model/History';
import { MetaBrawlerEntry, MetaStarpowerEntry, MetaMapEntry, MetaModeEntry, PlayerMetaModeEntry, MetaGadgetEntry, ModeMetaMap, MapMetaMap, BrawlerMetaEntry, MapMap, GadgetMetaEntry, StarpowerMetaEntry } from '../model/MetaEntry';
import { PlayerWinRates } from '../model/PlayerWinRates';
import { cache, request, post } from '../lib/request';
import { xpToHours, brawlerId, capitalizeWords, capitalize } from '../lib/util';

const apiUnofficialUrl = process.env.BRAWLAPI_URL || 'https://api.starlist.pro/';
const apiOfficialUrl = process.env.BRAWLSTARS_URL || 'https://api.brawlstars.com/v1/';
const trackerUrl = process.env.TRACKER_URL || '';
const clickerUrl = process.env.CLICKER_URL || '';
const tokenUnofficial = process.env.BRAWLAPI_TOKEN || '';
const tokenOfficial = process.env.BRAWLSTARS_TOKEN || '';

export default class BrawlstarsService {
  private readonly apiUnofficial = apiUnofficialUrl;
  private readonly apiOfficial = apiOfficialUrl;

  public getFeaturedPlayers() {
    return [ {
      tag: 'V8LLPPC',
      name: 'xXcuzMePlisThXx',
    }, {
      tag: '8PJRRG2C',
      name: 'TQ|GuilleVGX',
    }, {
      tag: 'V9QGJY9',
      name: 'Landi',
    }, {
      tag: '2L892GP',
      name: 'YAPIMARU_YT',
    }, {
      tag: '2Y02L28',
      name: 'Keith ツ',
    } ];
  }

  public async getActiveEvents() {
    const response = await request<{ active: BrawlstarsEvent[], upcoming: BrawlstarsEvent[] }>(
      'events',
      this.apiUnofficial,
      'fetch_events',
      { },
      { 'Authorization': 'Bearer ' + tokenUnofficial },
      1000,
      60*15,
    ).catch(() => ({
      active: [],
      upcoming: [],
    }));

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

    const response = await request<LeaderboardEntry[]>(
      '/top/exp',
      clickerUrl,
      'fetch_leaderboard',
      {},
      {},
      60000,
      600,
    );

    return response.map(entry => ({
      name: entry.name,
      tag: entry.tag,
      hours: xpToHours(entry.total_exp),
    }));
  }

  public async getTrophiesLeaderboard() {
    const response = await request<any>('rankings/global/players',
      this.apiOfficial,
      'fetch_trophies_leaderboard',
      { },
      { 'Authorization': 'Bearer ' + tokenOfficial },
      10000,
      60*10,
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

    const meta = await request<MetaBrawlerEntry[]>(
      '/meta/brawler',
      clickerUrl,
      'fetch_brawler_meta',
      { trophyrangeLower, trophyrangeHigher },
      {},
      60000,
      900,
    );

    const sumPicks = meta.reduce((sum, entry) => sum + entry.picks, 0);
    return meta.map((entry) => ({
      id: brawlerId(entry),
      name: entry.name,
      sampleSize: entry.picks,
      stats: {
        winRate: entry.winRate,
        starRate: entry.starRate,
        pickRate: entry.picks / sumPicks,
      },
    }) as BrawlerMetaEntry)
  }

  public async getStarpowerMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    if (clickerUrl == '') {
      return [];
    }

    const meta = await request<MetaStarpowerEntry[]>(
      '/meta/starpower',
      clickerUrl,
      'fetch_starpower_meta',
      { trophyrangeLower, trophyrangeHigher },
      {},
      60000,
      900,
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
    }) as StarpowerMetaEntry)
  }

  public async getGadgetMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    if (clickerUrl == '') {
      return [];
    }

    const meta = await request<MetaGadgetEntry[]>(
      '/meta/gadget',
      clickerUrl,
      'fetch_gadget_meta',
      { trophyrangeLower, trophyrangeHigher },
      {},
      60000,
      900,
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
    }) as GadgetMetaEntry)
  }

  public async getModeMeta(trophyrangeLower: string, trophyrangeHigher: string) {
    if (clickerUrl == '') {
      return [];
    }

    const meta = await request<MetaModeEntry[]>(
      '/meta/mode',
      clickerUrl,
      'fetch_mode_meta',
      { trophyrangeLower, trophyrangeHigher },
      {},
      60000,
      900, // 15m
    );

    const modeTotalPicks = meta.reduce((modeTotalPicks, entry: MetaModeEntry) => ({
      ...modeTotalPicks,
      [entry.mode]: (modeTotalPicks[entry.mode] || 0) + entry.picks,
    }), <{ [id: string]: number }>{});

    const nonNullStats = (entry: MetaModeEntry) => {
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
      if (!!entry.starRate && entry.starRate > 0) {
        stats.starRate = entry.starRate;
      }
      if (!!entry.rank1Rate && entry.rank1Rate > 0) {
        stats.rank1Rate = entry.rank1Rate;
      }
      return stats;
    };

    const modeMeta = meta.reduce((modeMeta, entry: MetaModeEntry) => ({
      ...modeMeta,
      [entry.mode]: {
        mode: entry.mode,
        sampleSize: modeTotalPicks[entry.mode],
        brawlers: {
          ...((modeMeta[entry.mode] || {}).brawlers || {}),
          [brawlerId(entry)]: {
            name: capitalizeWords(entry.name.toLowerCase()),
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

    return cache.wrap(`map-meta-${JSON.stringify(filters)}-${trophyrangeLower}-${trophyrangeHigher}`, async () => {
      const meta = await request<MetaMapEntry[]>(
        '/meta/map',
        clickerUrl,
        'fetch_map_meta',
        { trophyrangeLower, trophyrangeHigher },
        {},
        60000,
        900, // 15m
      );

      const mapTotalPicks = meta.reduce((mapTotalPicks, entry: MetaMapEntry) => ({
        ...mapTotalPicks,
        [entry.id]: (mapTotalPicks[entry.id] || 0) + entry.picks,
      }), <{ [id: string]: number }>{});

      const nonNullStats = (entry: MetaMapEntry) => {
        const fixed = (n: number) => Number.parseFloat(n.toFixed(4))
        const stats = <{ [stat: string]: number }>{};
        if (!!entry.wins && entry.wins > 0) {
          stats.winRate = fixed(entry.wins / entry.picks);
        }
        if (!!entry.rank && entry.rank > 0) {
          stats.rank = entry.rank;
        }
        if (!!entry.level && entry.level > 0) {
          stats.level = entry.level;
        }
        if (!!entry.duration && entry.duration > 0) {
          stats.duration = entry.duration;
        }
        stats.pickRate = fixed(entry.picks / mapTotalPicks[entry.id]);
        if (!!entry.starRate && entry.starRate > 0) {
          stats.starRate = fixed(entry.starRate);
        }
        if (!!entry.rank1 && entry.rank1 > 0) {
          stats.rank1 = entry.rank1;
        }
        if (!!entry.wins && entry.wins > 0) {
          stats.wins = entry.wins;
        }

        if (entry.isBigbrawler === 1) {
          return [...Object.entries(stats)]
            .reduce((stats, [prop, value]) => ({ ...stats, [prop + '_boss']: value }), {});
        }
        return stats;
      };

      const mapMeta = meta.reduce((mapMeta, entry: MetaMapEntry) => ({
        ...mapMeta,
        [entry.id]: {
          mode: entry.mode,
          map: entry.map,
          sampleSize: mapTotalPicks[entry.id],
          brawlers: {
            ...((mapMeta[entry.id] || {}).brawlers || {}),
            [brawlerId(entry)]: {
              name: capitalizeWords(entry.name.toLowerCase()),
              sampleSize: entry.picks,
              stats: {
                // boss has two records -> merge, boss stats get a suffix
                ...(((mapMeta[entry.id] || {}).brawlers || {})[brawlerId(entry)] || {}).stats,
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
    }, { ttl: 900 }) as Promise<MapMetaMap>; // 15m
  }

  public async getPlayerWinrates(tag: string) {
    tag = tag.replace(/^#/, '');

    let winRates: PlayerWinRates = { mode: [] };
    if (trackerUrl != '') {
      console.time('get winrates from tracker ' + tag);
      winRates = await request<PlayerWinRates>(
        `/winrates/${tag}`,
        trackerUrl,
        'fetch_player_winrates',
        {},
        {},
        10000
      );
      console.timeEnd('get winrates from tracker ' + tag);
    }

    const statsByMode = winRates.mode.reduce((statsByMode, entry) => ({
      ...statsByMode,
      [entry.mode]: entry,
    }), <{ [mode: string]: PlayerMetaModeEntry }>{});

    const rankToWinRate = (entry: PlayerMetaModeEntry) => 1 - (entry.rank - 1) / (entry.mode.includes('duo') ? 4 : 9);
    // stats are averages, so do `sum (picks * stat) / count`
    const statsSum = winRates.mode.reduce((statsSum, entry) => ({
      trophies: statsSum.trophies + (entry.trophyChange * entry.picks || 0),
      trophiesCount: statsSum.trophiesCount + (entry.trophyChange !== null ? entry.picks : 0),
      wins: statsSum.wins
        + ( entry.winRate !== null ? (entry.picks * entry.winRate) : 0 ) // 3v3
        + ( entry.winRate == null && entry.rank !== null ? (entry.picks * rankToWinRate(entry)) : 0 ), // free for all
      winsCount: statsSum.winsCount + (entry.winRate !== null || entry.rank !== null ? entry.picks : 0),
    }), { wins: 0, winsCount: 0, trophies: 0, trophiesCount: 0 });
    const totalStats = { winRate: 0, trophyRate: 0, battles: statsSum.trophiesCount, byMode: statsByMode };
    if (statsSum.winsCount > 0) {
      totalStats.winRate = statsSum.wins / statsSum.winsCount;
    }
    if (statsSum.trophiesCount > 0) {
      totalStats.trophyRate = statsSum.trophies / statsSum.trophiesCount;
    }

    return {
      totalStats,
      modes: {
        ...('gemGrab' in statsByMode ? {
          'gemGrab': {
            label: 'Gem Grab',
            icon: 'gemgrab_optimized.png',
            background: 'gemgrab.jpg',
            stats: {
              winRate: {
                label: 'Recent Win Rate',
                value: `${Math.round(statsByMode.gemGrab.winRate * 100)}%`,
              },
              starPlayerRate: {
                label: 'Recent Star Player Rate',
                value: `${Math.round(statsByMode.gemGrab.starRate * 100)}%`,
              },
            }
          } as Mode
        } : {}),
        'showdown': {
          label: 'Showdown',
          icon: 'showdown_optimized.png',
          background: 'showdown.jpg',
          stats: {
            ...('soloShowdown' in statsByMode ? {
              soloWinRate: {
                label: 'Recent Solo Rank 1 Rate',
                value: `${Math.round(statsByMode.soloShowdown.rank1Rate * 100)}%`,
              }
            } : {}),
            ...('duoShowdown' in statsByMode ? {
              duoWinRate: {
                label: 'Recent Duo Rank 1 Rate',
                value: `${Math.round(statsByMode.duoShowdown.rank1Rate * 100)}%`,
              }
            } : {})
          }
        } as Mode,
        ...('brawlBall' in statsByMode ? {
          'brawlBall': {
            label: 'Brawl Ball',
            icon: 'brawlball_optimized.png',
            background: 'brawlball.jpg',
            stats: {
              winRate: {
                label: 'Recent Win Rate',
                value: `${Math.round(statsByMode.brawlBall.winRate * 100)}%`,
              },
              starPlayerRate: {
                label: 'Recent Star Player Rate',
                value: `${Math.round(statsByMode.brawlBall.starRate * 100)}%`,
              },
            }
          } as Mode
        } : {}),
        ...('bounty' in statsByMode ? {
          'bounty': {
            label: 'Bounty',
            icon: 'bounty_optimized.png',
            background: 'bounty.jpg',
            stats: {
              winRate: {
                label: 'Recent Win Rate',
                value: `${Math.round(statsByMode.bounty.winRate * 100)}%`,
              },
              starPlayerRate: {
                label: 'Recent Star Player Rate',
                value: `${Math.round(statsByMode.bounty.starRate * 100)}%`,
              },
            }
          } as Mode
        } : {}),
        ...('heist' in statsByMode ? {
          'heist': {
            label: 'Heist',
            icon: 'heist_optimized.png',
            background: 'heist.jpg',
            stats: {
              winRate: {
                label: 'Recent Win Rate',
                value: `${Math.round(statsByMode.heist.winRate * 100)}%`,
              },
              starPlayerRate: {
                label: 'Recent Star Player Rate',
                value: `${Math.round(statsByMode.heist.starRate * 100)}%`,
              },
            }
          } as Mode
        } : {}),
        ...('siege' in statsByMode ? {
          'siege': {
            label: 'Siege',
            icon: '',
            background: 'siege.jpg',
            stats: {
              winRate: {
                label: 'Recent Win Rate',
                value: `${Math.round(statsByMode.siege.winRate * 100)}%`,
              },
              starPlayerRate: {
                label: 'Recent Star Player Rate',
                value: `${Math.round(statsByMode.siege.starRate * 100)}%`,
              },
            }
          } as Mode
        } : {}),
      }
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
      this.apiOfficial,
      'fetch_player',
      { },
      { 'Authorization': 'Bearer ' + tokenOfficial },
      1000,
      60*3,
    );
    // official API: with hash, unofficial API: no hash
    // brawltime assumes no hash
    player.tag = player.tag.replace(/^#/, '');

    const battleLog = await request<BattleLog>(
      'players/%23' + tag + '/battlelog',
      this.apiOfficial,
      'fetch_player_battles',
      { },
      { 'Authorization': 'Bearer ' + tokenOfficial },
      1000,
      60*3,
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

      let mode = battle.event.mode
      // FIXME API bug 2020-07-02
      if (mode == 'unknown') {
        if (battle.event.map == 'SUPER CITY') {
          mode = 'superCityRampage'
        } else {
          mode = 'hotZone'
        }
      }

      return {
        timestamp: new Date(Date.parse(isoDate)),
        event: {
          id: battle.event.id,
          mode: mode,
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
    } as { [id: string]: PlayerStatistic };

    const data = {
      tag: player.tag,
      name: player.name,
      hoursSpent,
      trophies: player.trophies,
      clubName: player.club === null ? '' : player.club!.name,
      history: [], // filled by /history
      totalStats: {}, // filled by /winrates
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
