import { Player as BrawlstarsPlayer, Event as BrawlstarsEvent } from '../model/Brawlstars';
import { Brawler, PlayerStatistic, Mode, Player } from '../model/Player';
import { request, post } from '../lib/request';
import { LeaderboardEntry } from '~/model/Leaderboard';
import History from '~/model/History';
import { MetaEntry } from '~/model/MetaEntry';

const trackerUrl = process.env.TRACKER_URL || '';
const token = process.env.BRAWLSTARS_TOKEN || '';

function xpToHours(xp: number) {
  return xp / 220; // 145h for 30300 XP as measured by @schneefux
}

export default class BrawlstarsService {
  private readonly apiBase = 'https://api.brawlapi.cf/v1/';

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
      this.apiBase,
      { type: 'current' },
      { 'Authorization': token }
    );

    const events = response.current;
    return events.map(({ mapName }) => mapName);
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
      15000,
      3600,
    );

    return response.map(entry => ({
      name: entry.name,
      tag: entry.tag,
      hours: xpToHours(entry.total_exp),
    }));
  }

  public async getMeta() {
    if (trackerUrl == '') {
      return [];
    }

    const response = await request<MetaEntry[]>(
      '/meta',
      trackerUrl,
      {},
      {},
      30000,
      10800,
    );

    return response.map(entry => ({
      id: entry.name.replace(/ /g, '_').toLowerCase(),
      ...entry
    }))
  }

  public async getPlayerStatistics(tag: string) {
    const player = await request<BrawlstarsPlayer>(
      'player',
      this.apiBase,
      { tag },
      { 'Authorization': token }
    );

    let history: History = { playerHistory: [], brawlerHistory: [] };
    if (trackerUrl != '') {
      try {
        await post<null>(trackerUrl + '/track', player);
        history = await request<History>(
          `/history/${tag}`,
          trackerUrl,
          {},
          {}
        );
      } catch (error) {
        console.error(error);
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

    const hoursSpent = xpToHours(player.totalExp);

    const avgProp = <K extends string>(prop: K) => <T extends Record<K, any>>(arr: T[]) => arr
      .map((o) => o[prop])
      .reduce((agg, cur) => agg + cur, 0)
      / arr.length;

    const heroStats = {
      averageVictories: {
        label: 'Average 3v3 Victories',
        value: Math.floor(player.victories / player.brawlers.length)
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
      modes: {
        '3v3': {
          label: '3v3',
          icon: 'gemgrab_optimized.png',
          background: 'gemgrab.jpg',
          stats: {
            victories: {
              label: 'Victories',
              value: player.victories,
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
              value: player.soloShowdownVictories,
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
              value: player.duoShowdownVictories,
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
              value: player.bestTimeAsBigBrawler,
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
              value: player.bestRoboRumbleTime,
            }
          }
        } as Mode,
      },
    } as Player;

    return data;
  }
}
