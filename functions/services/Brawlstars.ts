import { Player as BrawlstarsPlayer, Event as BrawlstarsEvent, BattleLog, BattlePlayer } from '../model/Brawlstars';
import { Brawler, PlayerStatistic, Mode, Player } from '../model/Player';
import { request, post } from '../lib/request';
import { LeaderboardEntry } from '~/model/Leaderboard';
import History from '~/model/History';
import { MetaEntry, MetaModeEntry } from '~/model/MetaEntry';

const trackerUrl = process.env.TRACKER_URL || '';
const token = process.env.BRAWLSTARS_TOKEN || '';

function xpToHours(xp: number) {
  return xp / 220; // 145h for 30300 XP as measured by @schneefux
}

// TODO fromEntries polyfill, remove as soon as server is on node@12
// https://github.com/ungap/from-entries/blob/master/index.js
var fromEntries = Object.fromEntries || function fromEntries(iterable: any) {
  var entries = ('entries' in iterable ? iterable.entries() : iterable);
  var object = {};
  var entry;
  while ((entry = entries.next()) && !entry.done) {
    var pair = entry.value;
    Object.defineProperty(object, pair[0], {
      configurable: true,
      enumerable: true,
      writable: true,
      value: pair[1]
    });
  }
  return object;
};

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

    const meta = await request<MetaEntry[]>(
      '/meta',
      trackerUrl,
      {},
      {},
      30000,
      10800,
    );

    const metaByMode = await request<MetaModeEntry[]>(
      '/meta/by-mode',
      trackerUrl,
      {},
      {},
      30000,
      10800,
    );

    // TODO use id not mode+map
    const sumPicksByEvent = <{ [event: string]: number }> {};
    metaByMode.forEach((entry) => {
      sumPicksByEvent[entry.mode + ',' + entry.map] = (sumPicksByEvent[entry.mode + ',' + entry.map] || 0) + entry.picks;
    });

    return meta.map((entry) => ({
      id: entry.name.replace(/ /g, '_').toLowerCase(),
      ...entry,
      events: fromEntries(metaByMode
        .filter((modeEntry) => modeEntry.name.toLowerCase() == entry.name.toLowerCase())
        .map((modeEntry) => [
          modeEntry.mode + (modeEntry.isBigbrawler !== null && modeEntry.isBigbrawler === 1 ? 'Boss' : '') +
          ',' +
          modeEntry.map, {
            winRate: modeEntry.wins / modeEntry.picks,
            rank: modeEntry.rank,
            pickRate: modeEntry.picks / sumPicksByEvent[modeEntry.mode + ',' + modeEntry.map],
            duration: modeEntry.duration,
            starRate: modeEntry.stars / modeEntry.picks,
            wins: modeEntry.wins,
          }])
        )
    }));
  }

  public async getPlayerStatistics(tag: string) {
    const player = await request<BrawlstarsPlayer>(
      'player',
      this.apiBase,
      { tag },
      { 'Authorization': token }
    );

    const battleLog = await request<BattleLog>(
      'player/battlelog',
      this.apiBase,
      { tag },
      { 'Authorization': token }
    );

    const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    const capitalize = (str: string) => str.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
    const transformPlayer = (player: BattlePlayer) => ({
      tag: player.tag.replace('#', ''),
      name: player.name,
      brawler: player.brawler.name.replace(/ /, '_').toLowerCase(),
      brawlerTrophies: player.brawler.trophies,
    })
    const battles = battleLog.items.map((battle) => {
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

      return {
        timestamp: new Date(Date.parse(isoDate)),
        mode: {
          label: capitalize(mode.replace(/_/g, ' ')),
          background: `${modeId}.jpg`,
        },
        result,
        trophyChange: battle.battle.trophyChange,
        teams: (battle.battle.teams !== undefined ? battle.battle.teams : battle.battle.players.map((p) => [p])).map(teams => teams.map(transformPlayer)),
        // TODO add big brawler
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
      battles,
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
