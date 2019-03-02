import AppService from './AppService';
import {
  Player as VaingloryPlayer,
  Match as VaingloryMatch,
  Roster as VaingloryRoster,
  Participant as VaingloryParticipant,
  ResponseCollection,
  EntityRelation,
} from '../model/VaingloryPlayer';
import { Hero, PlayerStatistic, Mode, Player } from '../model/Player';
import { request, flatten2d } from '../util';
import Shard from '../model/Shard';

export default class VaingloryService implements AppService {
  private readonly apiBase = 'https://api.dc01.gamelockerapp.com';

  constructor(private token: string) {};

  public getNameRegex() {
    return '.{1,16}';
  }

  public getShards() {
    return [ {
      'id': 'na',
      'label': 'North America'
    }, {
      'id': 'eu',
      'label': 'Europe'
    }, {
      'id': 'sg',
      'label': 'South East Asia'
    }, {
      'id': 'sa',
      'label': 'South Africa'
    }, {
      'id': 'ea',
      'label': 'East Asia'
    }, {
      'id': 'cn',
      'label': 'China'
    } ] as Shard[];
  }

  public getLabels() {
    return {
      'appTitle': 'Vainglory',
      'heroes': 'Heroes',
      'userId': 'name',
      'disclaimer': `
        This content is not affiliated with, endorsed, sponsored, or specifically approved by Super Evil Mega Corp and Super Evil Mega Corp is not responsible for it.
      `,
    };
  }

  public getFeaturedPlayers() {
    return [ {
      id: 'shutterfly',
      shard: 'eu',
      name: 'shutterfly',
    } ];
  }

  private getPlayer(shard: string, name: string) {
    return request<ResponseCollection<VaingloryPlayer, null>>(
      `/shards/${shard}/players`,
      this.apiBase,
      { 'filter[playerNames]': name },
      {
        'X-Title-Id': 'semc-vainglory',
        'Authorization': 'Bearer ' + this.token,
        'Accept': 'application/vnd.api+json',
      }
    ).then((response) => response.data[0])
     .catch(() => null);
  }

  private async getMatchStatistics(player: VaingloryPlayer) {
    return request<ResponseCollection<VaingloryMatch, VaingloryParticipant|VaingloryRoster>>(
      `/shards/${player.attributes.shardId}/matches`,
      this.apiBase,
      { 'filter[playerIds]': player.id },
      {
        'X-Title-Id': 'semc-vainglory',
        'Authorization': 'Bearer ' + this.token,
        'Accept': 'application/vnd.api+json',
      }
    ).then((response) => {
      const participants = (response.included
        .filter((entityLike: EntityRelation) => entityLike.type == 'participant') as VaingloryParticipant[])
        .filter((participant: VaingloryParticipant) => participant.relationships.player.data.id == player.id);

      const lastMatchStatsByHero = new Map<string, {
        win: boolean;
        kills: number;
        deaths: number;
        assists: number;
        farm: number;
      }>();
      participants.forEach((participant) => {
        const hero = participant.attributes.actor.slice(1, -1);
        const pas = participant.attributes.stats;
        if (!lastMatchStatsByHero.has(hero)) {
          lastMatchStatsByHero.set(hero, {
            win: pas.winner,
            kills: pas.kills,
            deaths: pas.deaths,
            assists: pas.assists,
            farm: pas.farm,
          });
        }
      });

      return [...lastMatchStatsByHero.entries()];
    }).catch(() => []);
  }

  public async getPlayerStatistics(shard: string, name: string) {
    const player = await this.getPlayer(shard, name);
    if (player == null) {
      return null;
    }
    const matchStatistics = await this.getMatchStatistics(player);

    const heroes = {} as { [id: string]: Hero };
    matchStatistics.forEach(([hero, last]) => {
      heroes[hero] = {
        label: hero,
        icon: `/images/vainglory/hero/icon/${hero}.jpg`,
        stats: {
          lastResult: {
            label: 'last result',
            value: last.win? 'WIN' : 'LOSS',
            icon: '',
          },
          lastKda: {
            label: 'last KDA',
            value: `${last.kills}/${last.deaths}/${last.assists}`,
            icon: '',
          },
          lastFarm: {
            label: 'last farm',
            value: last.farm,
            icon: '',
          }
        }
      } as Hero;
    });

    const tierToName = (tier: number) => {
      if (tier == -1) return 'Unranked';
      if (tier <= 2) return 'Just Beginning';
      if (tier <= 5) return 'Getting There';
      if (tier <= 8) return 'Rock Solid';
      if (tier <= 11) return 'Worthy Foe';
      if (tier <= 14) return 'Got Swagger';
      if (tier <= 17) return 'Credible Threat';
      if (tier <= 20) return 'The Hotness';
      if (tier <= 23) return 'Simply Amazing';
      if (tier <= 26) return 'Pinnacle Of Awesome';
      return 'Vainglorious';
    };

    const stats = {
      skillTier: {
        label: 'Skill Tier',
        value: tierToName(player.attributes.stats.skillTier)
      },
    } as { [id: string]: PlayerStatistic };

    const pasgp = player.attributes.stats.gamesPlayed;
    const minutesSpent = (pasgp['ranked'] + pasgp['casual']) * 20
      + (pasgp['casual_5v5'] + pasgp['ranked_5v5']) * 25
      + (pasgp['blitz'] + pasgp['blitz_rounds']) * 5
      + pasgp['aral'] * 15;

    const data = {
      id: player.id,
      name: player.attributes.name,
      shard: player.attributes.shardId,
      minutesSpent,
      heroes,
      stats,
      modes: {
        casual: {
          label: '3v3 Casual',
          icon: '',
          background: '/images/vainglory/mode/background/halcyon_fold.png',
          stats: {
            played: {
              label: 'Games',
              value: player.attributes.stats.gamesPlayed.casual,
            }
          }
        } as Mode,
        ranked: {
          label: '3v3 Ranked',
          icon: '',
          background: '/images/vainglory/mode/background/halcyon_fold.png',
          stats: {
            played: {
              label: 'Games',
              value: player.attributes.stats.gamesPlayed.ranked,
            }
          }
        } as Mode,
        casual5v5: {
          label: '5v5 Casual',
          icon: '',
          background: '/images/vainglory/mode/background/sovereigns_rise.png',
          stats: {
            played: {
              label: 'Games',
              value: player.attributes.stats.gamesPlayed.casual_5v5,
            }
          }
        } as Mode,
        ranked5v5: {
          label: '5v5 Ranked',
          icon: '',
          background: '/images/vainglory/mode/background/sovereigns_rise.png',
          stats: {
            played: {
              label: 'Games',
              value: player.attributes.stats.gamesPlayed.ranked_5v5,
            }
          }
        } as Mode,
        blitz: {
          label: 'Blitz',
          icon: '/images/vainglory/mode/icon/blitz.png',
          background: '/images/vainglory/mode/background/halcyon_fold.png',
          stats: {
            played: {
              label: 'Games',
              value: player.attributes.stats.gamesPlayed.blitz,
            }
          }
        } as Mode,
        aral: {
          label: 'ARAL',
          icon: '',
          background: '/images/vainglory/mode/background/halcyon_fold.png',
          stats: {
            played: {
              label: 'Games',
              value: player.attributes.stats.gamesPlayed.aral,
            }
          }
        } as Mode,
      },
    } as Player;

    return data;
  }
}
