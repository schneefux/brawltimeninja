import {
  Player as WorldOfTanksPlayer,
  Vehicle as WorldOfTanksVehicle,
  Achievement as WorldOfTanksAchievement,
} from '../model/WorldOfTanks';
import AppService from './AppService';
import { WargamingWrapper } from './WargamingWrapper';
import { Hero, Player, PlayerStatistic, HeroStatistic } from '../model/Player';
import { fixedPercent } from '../util';

export default class WorldOfTanksService implements AppService {
  private wrapper: WargamingWrapper;

  constructor(private applicationId: string) {
    this.wrapper = new WargamingWrapper(applicationId, this.getBase);
  }

  private getBase(region: string) {
    return `https://api.worldoftanks.${region}/wot`;
  }

  public getShards() {
    return [ {
      id: 'eu',
      label: 'Europe'
    }, {
      id: 'ru',
      label: 'Russia'
    }, {
      id: 'na',
      label: 'North America'
    }, {
      id: 'asia',
      label: 'Asia'
    } ];
  }

  public getLabels() {
    return {
      'appTitle': 'World Of Tanks',
      'heroes': 'Tanks',
      'userId': 'nickname',
      'nameRegex': this.wrapper.getNameRegex(),
      'disclaimer': `
        This content is not affiliated with, endorsed, sponsored, or specifically approved by Supercell and Supercell is not responsible for it. For more information see Supercell's Fan Content Policy: www.supercell.com/fan-content-policy.
      `,
    };
  }

  public getFeaturedPlayers() {
    return [ {
      id: 'daveouk',
      shard: 'eu',
      name: 'daveouk',
    } ];
  }

  public async getPlayerStatistics(region: string, name: string) {
    const id = await this.wrapper.getPlayerId(region, name);
    if (id == null) {
      return null;
    }

    const player = await this.wrapper.getPlayerData<WorldOfTanksPlayer>(region, id);

    if (player == null) {
      return null;
    }

    const vehicles = await this.wrapper.getVehicles<WorldOfTanksVehicle>(region, id);

    const heroes = {} as { [id: string]: Hero };
    vehicles.forEach((vehicle) => {
      heroes[vehicle.tank_id] = {
        label: `${vehicle.tank_id}`,
        icon: '',
        stats: {
          battles: {
            label: 'battles',
            value: vehicle.statistics.battles,
            icon: '',
          },
          winRate: {
            label: 'win rate',
            value: fixedPercent(vehicle.statistics.wins, vehicle.statistics.battles),
            icon: '',
          },
        }
      } as Hero;
    });

    const stats = {
      skillTier: {
        label: 'Global Rating',
        value: `${player.global_rating}`
      },
    } as { [id: string]: PlayerStatistic };

    const minutesSpent = 0;

    const heroStats = {
      winRate: {
        label: 'Win Rate',
        icon: '',
        value: fixedPercent(player.statistics.all.wins, player.statistics.all.battles),
      },
      battles: {
        label: 'Battles',
        icon: '',
        value: player.statistics.all.battles,
      },
    } as { [id: string]: HeroStatistic };

    const data = {
      id: `${player.account_id}`,
      name: player.nickname,
      shard: region,
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
