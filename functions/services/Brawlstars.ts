import { Player as BrawlstarsPlayer, Event as BrawlstarsEvent } from '../model/Brawlstars';
import { Hero, PlayerStatistic, Mode, Player } from '../model/Player';
import { request } from '../util';

const logStats = !!process.env.LOG_STATS;

export default class BrawlstarsService {
  private readonly apiBase = 'https://brawlapi.cf/api/' // 'https://api.brawlapi.cf/v1/';

  constructor(private token: string) {}

  public getFeaturedPlayers() {
    return [ {
      id: 'V8LLPPC',
      name: 'xXcuzMePlisThXx',
    }, {
      id: '2Y02L28',
      name: 'Keith',
    }, {
      id: 'V9QGJY9',
      name: 'Landi',
    } ];
  }

  public async getEvents() {
    const response = await request<{ current: BrawlstarsEvent[] }>(
      'events',
      this.apiBase,
      { type: 'current' },
      { 'Authorization': this.token }
    );

    const events = response.current;
    return events.map(({ mapName }) => mapName);
  }

  public async getPlayerStatistics(tag: string) {
    const player = await request<BrawlstarsPlayer>(
      'player',
      this.apiBase,
      { tag },
      { 'Authorization': this.token }
    );

    if (logStats) {
      console.log(JSON.stringify(player))
    }

    const heroes = {} as { [id: string]: Hero };
    player.brawlers
      .sort((b1, b2) => b2.highestTrophies - b1.highestTrophies)
      .forEach((brawler) => {
        const brawlerId = brawler.name.toLowerCase().replace(' ', '_');
        heroes[brawlerId] = {
          label: brawler.name,
          stats: {
            rank: {
              label: 'Rank',
              value: brawler.rank,
              icon: 'leaderboards_optimized.png'
            },
            trophies: {
              label: 'Trophies',
              value: brawler.trophies,
              icon: 'trophy_optimized.png'
            },
            maxTrophies: {
              label: 'Max Trophies',
              value: brawler.highestTrophies,
              icon: 'trophy_optimized.png'
            },
            level: {
              label: 'Power Level',
              value: brawler.power,
              icon: brawler.power == 10?
                'starpower_optimized.png'
                :'powerpoint_optimized.png'
            }
          }
        } as Hero;
      });

    const stats = {
      trophies: {
        label: 'Current Trophies',
        value: player.trophies
      },
      highestTrophies: {
        label: 'Max Trophies',
        value: player.highestTrophies
      },
      expLevel: {
        label: 'Experience Level',
        value: player.expLevel
      },
    } as { [id: string]: PlayerStatistic };

    if (player.club != undefined) {
      stats.clubName = {
        label: 'Club',
        value: player.club.name
      };
    }

    const minutesSpent =
      player.victories * 2 * 3 + // 50% win rate * 3mins
      player.soloShowdownVictories * 10 * 3 + // 1/10 win rate * 3mins
      player.duoShowdownVictories * 5 * 3 // 1/5 win rate * 3mins
    ;

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
      id: player.tag,
      name: player.name,
      minutesSpent,
      heroes,
      heroStats,
      stats,
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
