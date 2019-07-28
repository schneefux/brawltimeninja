import { Player as BrawlstarsPlayer, Event as BrawlstarsEvent, BattleLog, BattlePlayer } from '../model/Brawlstars';
import { Brawler, PlayerStatistic, Mode, Player } from '../model/Player';
import { request, post } from '../lib/request';
import { LeaderboardEntry } from '~/model/Leaderboard';
import History from '~/model/History';
import { MetaEntry, MetaModeEntry } from '~/model/MetaEntry';

const trackerUrl = process.env.TRACKER_URL || '';
const tokenUnofficial = process.env.BRAWLAPI_TOKEN || '';
const tokenOfficial = process.env.BRAWLSTARS_TOKEN || '';

function xpToHours(xp: number) {
  return xp / 220; // 145h for 30300 XP as measured by @schneefux
}

const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
const capitalize = (str: string) => str.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
const capitalizeWords = (str: string) => str.split(' ').map(w => capitalize(w)).join(' ')

export default class BrawlstarsService {
  private readonly apiUnofficial = 'https://api.brawlapi.cf/v1/';
  private readonly apiOfficial = 'https://api.brawlstars.com/v1/';

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

  public async getEvents() {
    const response = await request<{ current: BrawlstarsEvent[] }>(
      'events',
      this.apiUnofficial,
      { type: 'current' },
      { 'Authorization': tokenUnofficial }
    );

    return response.current.map((event) => ({
      // official BS API returns 150000xy event ids
      // unofficial API returns  15000xy event ids
      id: event.mapId.toString().replace(/^150/, '1500'),
      map: event.mapName,
      mode: event.gameMode,
    }));
  }

  // TODO deduplicate this code
  public async getUpcomingEvents() {
    const response = await request<{ upcoming: BrawlstarsEvent[] }>(
      'events',
      this.apiUnofficial,
      { type: 'upcoming' },
      { 'Authorization': tokenUnofficial }
    );

    return response.upcoming.map((event) => ({
      // official BS API returns 150000xy event ids
      // unofficial API returns  15000xy event ids
      id: event.mapId.toString().replace(/^150/, '1500'),
      map: event.mapName,
      mode: event.gameMode,
    }));
  }

  public async getHoursLeaderboard() {
    if (trackerUrl == '') {
      return [];
    }

    const response = await request<LeaderboardEntry[]>(
      '/top/exp',
      trackerUrl,
      {},
      {},
      10000,
      600,
    );

    return response.map(entry => ({
      name: entry.name,
      tag: entry.tag,
      hours: xpToHours(entry.total_exp),
    }));
  }

  public async getBrawlerMeta() {
    if (trackerUrl == '') {
      return [];
    }

    const meta = await request<MetaEntry[]>(
      '/meta/brawler',
      trackerUrl,
      {},
      {},
      10000,
      600,
    );

    const sumPicks = meta.reduce((sum, entry) => sum + entry.picks, 0);
    return meta.map((entry) => ({
      id: entry.name.replace(/ /g, '_').toLowerCase(),
      name: entry.name,
      sampleSize: entry.picks,
      stats: {
        trophies: entry.trophies,
        trophyChange: entry.trophyChange,
        winRate: entry.winRate,
        starRate: entry.starRate,
        pickRate: entry.picks / sumPicks,
      },
    }))
  }

  public async getMapMeta(filters: { [name: string]: string }) {
    if (trackerUrl == '') {
      return [];
    }

    const meta = await request<MetaModeEntry[]>(
      '/meta/map',
      trackerUrl,
      {},
      {},
      30000,
      900, // 15m
    );

    const mapTotalPicks = meta.reduce((mapTotalPicks, entry: MetaModeEntry) => ({
      ...mapTotalPicks,
      [entry.id]: (mapTotalPicks[entry.id] || 0) + entry.picks,
    }), <{ [id: string]: number }>{});

    const nonNullStats = (entry: MetaModeEntry) => {
      const stats = <{ [stat: string]: number }>{};
      if (!!entry.wins && entry.wins > 0) {
        stats.winRate = entry.wins / entry.picks;
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
      stats.pickRate = entry.picks / mapTotalPicks[entry.id];
      if (!!entry.starRate && entry.starRate > 0) {
        stats.starRate = entry.starRate;
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

    const brawlerId = (entry: MetaModeEntry) =>
      entry.name.replace(/ /g, '_').toLowerCase();

    const mapMeta = meta.reduce((mapMeta, entry: MetaModeEntry) => ({
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
    }), <{
      [event: string]: {
        mode: string
        map: string
        sampleSize: number
        brawlers: {
          [brawler: string]: {
            name: string
            sampleSize: number
            stats: {
              [stat: string]: number
            }
          }
        }
      }}>{});

    if (filters.current !== undefined) {
      const currentEvents = await this.getEvents();
      const currentEventIds = currentEvents.map(({ id }) => id);
      Object.keys(mapMeta).forEach((eventId) => {
        if (!currentEventIds.includes(eventId)) {
          delete mapMeta[eventId];
        }
      });
    }

    if (filters.include !== undefined) {
      const whitelistedIds = filters.include.split(',');
      Object.keys(mapMeta).forEach((eventId) => {
        if (!whitelistedIds.includes(eventId)) {
          delete mapMeta[eventId];
        }
      });
    }

    return mapMeta;
  }

  public async getPlayerStatistics(tag: string) {
    const player = await request<BrawlstarsPlayer>(
      'players/%23' + tag,
      this.apiOfficial,
      { },
      { 'Authorization': 'Bearer ' + tokenOfficial }
    );
    // official API: with hash, unofficial API: no hash
    // brawltime assumes no hash
    player.tag = player.tag.replace(/^#/, '');

    const battleLog = await request<BattleLog>(
      'players/%23' + tag + '/battlelog',
      this.apiOfficial,
      { },
      { 'Authorization': 'Bearer ' + tokenOfficial }
    );

    const battles = battleLog.items.map((battle) => {
      const transformPlayer = (player: BattlePlayer) => ({
        tag: player.tag.replace('#', ''),
        name: player.name,
        brawler: player.brawler.name.replace(/ /, '_').toLowerCase(),
        brawlerTrophies: player.brawler.trophies,
        isBigbrawler: battle.battle.bigBrawler === undefined ? false : battle.battle.bigBrawler.tag == player.tag,
      })

      let mode = camelToSnakeCase(battle.event.mode)
      let modeId = mode.replace('_', '');

      if (modeId == 'biggame') {
        mode = 'Bossfight';
        modeId = 'bossfight';
      }
      if (modeId.endsWith('showdown')) {
        modeId = 'showdown';
      }

      let result;
      if (battle.battle.duration !== undefined) {
        // bossfight, gem grab, ...
        const minutes = Math.floor(battle.battle.duration / 60);
        const seconds = battle.battle.duration % 60;
        result = `${minutes}m ${seconds}s`;
      }
      if (battle.battle.result !== undefined) {
        // 3v3
        result = capitalize(battle.battle.result);
      }
      if (battle.battle.rank !== undefined) {
        // showdown
        result = `Rank ${battle.battle.rank}`;
      }

      const time = battle.battleTime;
      const isoDate = `${time.slice(0, 4)}-${time.slice(4, 6)}-${time.slice(6, 8)}T${time.slice(9, 11)}:${time.slice(11, 13)}:${time.slice(13)}`;

      const teamsWithoutBigBrawler = (battle.battle.teams !== undefined ? battle.battle.teams : battle.battle.players.map((p) => [p]));
      const teams = battle.battle.bigBrawler !== undefined ? teamsWithoutBigBrawler.concat([[battle.battle.bigBrawler]]) : teamsWithoutBigBrawler;

      return {
        timestamp: new Date(Date.parse(isoDate)),
        mode: {
          label: battle.event.map,
          background: `${modeId}.jpg`,
        },
        result,
        trophyChange: battle.battle.trophyChange,
        teams: teams.map(t => t.map(transformPlayer)),
      }
    }).sort((b1, b2) => b2.timestamp.valueOf() - b1.timestamp.valueOf());

    let history: History = { playerHistory: [], brawlerHistory: [] };
    if (trackerUrl != '') {
      try {
        console.time('call tracker service');
        await post<null>(trackerUrl + '/track', { player, battleLog }, 1000);
        history = await request<History>(
          `/history/${tag}`,
          trackerUrl,
          {},
          {}
        );
      } catch (error) {
        console.error(error);
      } finally {
        console.timeEnd('call tracker service');
      }
    }

    const brawlers = {} as { [id: string]: Brawler };
    player.brawlers
      .sort((b1, b2) => b2.highestTrophies - b1.highestTrophies)
      .forEach((brawler) => {
        const brawlerId = brawler.name.toLowerCase().replace(' ', '_');
        brawlers[brawlerId] = {
          name: brawler.name,
          rank: brawler.rank,
          trophies: brawler.trophies,
          highestTrophies: brawler.highestTrophies,
          power: brawler.power,
          history: history.brawlerHistory
            .filter(({ name }) => name == brawler.name)
            .map(({ timestamp, trophies }) => ({ timestamp, trophies })),
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
      clubName: player.club === null ? '' : player.club.name,
      history: history.playerHistory,
      brawlers,
      heroStats,
      battles,
      modes: {
        '3v3': {
          label: '3v3',
          icon: 'gemgrab_optimized.png',
          background: 'gemgrab.jpg',
          stats: {
            victories: {
              label: 'Victories',
              value: player["3vs3Victories"],
            }
          }
        } as Mode,
        'soloShowdown': {
          label: 'Solo Showdown',
          icon: 'showdown_optimized.png',
          background: 'showdown.jpg',
          stats: {
            victories: {
              label: 'Victories',
              value: player.soloVictories,
            }
          }
        } as Mode,
        'duoShowdown': {
          label: 'Duo Showdown',
          icon: 'duoshowdown_optimized.png',
          background: 'showdown.jpg',
          stats: {
            victories: {
              label: 'Victories',
              value: player.duoVictories,
            }
          }
        } as Mode,
        'bossfight': {
          label: 'Bossfight',
          icon: 'bossfight_optimized.png',
          background: 'bossfight.jpg',
          stats: {
            minutes: {
              label: 'survived',
              value: `${Math.floor(player.bestTimeAsBigBrawler/60)}m ${player.bestTimeAsBigBrawler%60}s`,
            }
          }
        } as Mode,
        'roborumble': {
          label: 'Robo Rumble',
          icon: 'roborumble_optimized.png',
          background: 'roborumble.jpg',
          stats: {
            minutes: {
              label: 'survived',
              value: `${Math.floor(player.bestRoboRumbleTime/60)}m ${player.bestRoboRumbleTime%60}s`,
            }
          }
        } as Mode,
      },
    } as Player;

    return data;
  }
}
