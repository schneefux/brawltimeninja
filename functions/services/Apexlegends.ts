import {
  Player as ApexlegendsPlayer,
  PlayerStub as ApexlegendsPlayerStub,
  Characters as ApexlegendsCharacters,
} from '../model/ApexlegendsPlayer';
import { Hero, PlayerStatistic, Player } from '../model/Player';
import { request, capitalize } from '../util';
import AppService from './AppService';

export default class ApexlegendsService implements AppService {
  private readonly apiBase = 'https://apextab.com/api/';

  public getNameRegex() {
    return '.*';
  }

  public getShards() {
    return [ {
      'id': 'pc',
      'label': 'PC'
    }, {
      'id': 'psn',
      'label': 'PlayStation'
    }, {
      'id': 'xbl',
      'label': 'Xbox'
    } ];
  }

  public getLabels() {
    return {
      'appTitle': 'Apex Legends',
      'heroes': 'Characters',
      'userId': 'name',
    };
  }

  public getFeaturedPlayers() {
    return [ {
      id: 'DiegosaursTTV',
      shard: 'pc',
      name: 'DiegosaursTTV',
    }, {
      id: 'NRG_dizzy',
      shard: 'pc',
      name: 'NRG_dizzy',
    }, {
      id: 'Aotsuki_tv',
      shard: 'pc',
      name: 'Aotsuki_tv',
    } ];
  }

  private getPlayer(platform: string, name: string) {
    return request<{ results: ApexlegendsPlayerStub[] }>(
      'search.php',
      this.apiBase,
      { search: name, platform },
      { }
    ).then((response) => {
      const players = response.results.filter((player) => player.name == name);
      return players.length == 0 ? null : players[0]
    }).catch(() => null)
  }

  public async getPlayerStatistics(platform: string, name: string) {
    const playerStub = await this.getPlayer(platform, name);
    if (playerStub == null) {
      return null;
    }

    const player = await request<ApexlegendsPlayer>(
      'player.php',
      this.apiBase,
      { aid: playerStub.aid },
      { }
    );

    const statProps = ['kills', 'headshots', 'damage', 'matches']
      .filter((prop) => player[<keyof ApexlegendsPlayer>prop] != '0');

    const heroes = {} as { [id: string]: Hero };
    ApexlegendsCharacters.forEach((character) => {
      const hero = {
        label: character,
        icon: `/images/apexlegends/hero/${character}.png`,
        stats: {},
      } as Hero;
      statProps.forEach((statProp) => {
        const value = player[<keyof ApexlegendsPlayer>`${statProp}_${character}`];
        if (! (value != null && (typeof value == 'number' || typeof value == 'string'))) {
            return;
        }
        hero.stats[statProp] = {
          label: capitalize(statProp),
          value,
          icon: '',
        };
      });

      heroes[character] = hero;
    });

    const stats = {
      level: {
        label: 'Level',
        value: player.level
      },
      globalRank: {
        label: 'Global Rank',
        value: `#${player.globalrank}`
      },
    } as { [id: string]: PlayerStatistic };
    if (player.skillratio != 0) {
      stats.skillRatio = {
        label: 'Skill Ratio',
        value: player.skillratio
      };
    }

    const minutesSpent = 0;

    const heroStats = {} as { [id: string]: PlayerStatistic };
    statProps.forEach((statProp) => {
      const value = player[<keyof ApexlegendsPlayer>statProp];
      if (! (value != null && (typeof value == 'number' || typeof value == 'string'))) {
          return;
      }
      heroStats[statProp] = {
        label: `Total ${capitalize(statProp)}`,
        value
      };
    });

    const data = {
      id: player.aid,
      name: player.name,
      minutesSpent,
      heroes,
      heroStats,
      stats,
      modes: {
      },
    } as Player;

    return data;
  }
}
