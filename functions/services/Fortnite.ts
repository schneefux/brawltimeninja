import {
  Player as FortnitePlayer,
  PlayerStub as FortnitePlayerStub,
} from '../model/Fortnite';
import { Hero, PlayerStatistic, Player } from '../model/Player';
import { request, capitalize } from '../util';
import AppService from './AppService';

export default class FortniteService implements AppService {
  private readonly apiBase = 'https://fortnite-public-api.theapinetwork.com/';

  public getNameRegex() {
    return '.*';
  }

  public getShards() {
    return [];
  }

  public getLabels() {
    return {
      'appTitle': 'Fortnite',
      'heroes': '',
      'userId': 'name',
      'disclaimer': `
        This content is not affiliated with, endorsed, sponsored, or specifically approved by Epic Games and Epic Games is not responsible for it.
      `,
    };
  }

  public getFeaturedPlayers() {
    return [ {
      id: 'Ninja',
      shard: 'global',
      name: 'Ninja',
    } ];
  }

  public async getPlayerStatistics(platform: string, name: string) {
    const playerStub = await request<FortnitePlayerStub>('/prod09/users/id', this.apiBase, { username: name }, { });
    if (playerStub == null) {
      return null;
    }

    const player = await request<FortnitePlayer>(
      '/prod09/users/public/br_stats_v2',
      this.apiBase,
      { user_id: playerStub.uid },
      { }
    );

    const stats = {
      kills: {
        label: 'Kills',
        value: player.overallData.defaultModes.kills,
      },
    } as { [id: string]: PlayerStatistic };

    const minutesSpent = 0;

    const data = {
      id: playerStub.uid,
      name: playerStub.username,
      minutesSpent,
      heroes: {},
      heroStats: {},
      stats,
      modes: {
      },
    } as Player;

    return data;
  }
}
