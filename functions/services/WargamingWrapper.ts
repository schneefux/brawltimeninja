import { request } from '../util';
import {
  Response as WargamingResponse,
  PlayerIdentifier as WargamingPlayerIdentifier,
} from '../model/Wargaming';

export class WargamingWrapper {
  constructor(
    private applicationId: string,
    private getBase: (region: string) => string) {}

  public getNameRegex() {
    // https://worldoftanks.com/en/content/guide/general/nickname-change-guide/
    return '[A-Za-z0-9_]{3,24}';
  }

  public getPlayerId(region: string, name: string) {
    return request<WargamingResponse<WargamingPlayerIdentifier[]>>(
      '/account/list/',
      this.getBase(region), {
        'application_id': this.applicationId,
        'type': 'exact',
        'limit': '1',
        'search': name,
      }, { }
    ).then((res) => res != null && res.meta.count > 0 ? res.data[0].account_id : null);
  }

  public getPlayerData<Player>(region: string, id: number) {
    return request<WargamingResponse<{ [id: string]: Player }>>(
      '/account/info/',
      this.getBase(region), {
        'application_id': this.applicationId,
        'account_id': id.toString(),
        'fields': '',
        'extra': '',
        'language': '',
      }, { }
    ).then((res) => res != null ? res.data[id] : null);
  }

  public getAchievements<Achievement>(region: string, id: number) {
    return request<WargamingResponse<{ [id: string]: Achievement[] }>>(
      '/account/achievement/',
      this.getBase(region), {
        'application_id': this.applicationId,
        'account_id': id.toString(),
        'fields': '',
        'language': '',
      }, { }
    ).then((res) => res != null ? res.data[id] : []);
  }

  public getVehicles<Vehicle>(region: string, id: number) {
    return request<WargamingResponse<{ [id: string]: Vehicle[] }>>(
      '/account/tanks/',
      this.getBase(region), {
        'application_id': this.applicationId,
        'account_id': id.toString(),
        'fields': '',
        'tank_id': '',
        'language': '',
      }, { }
    ).then((res) => res != null ? res.data[id] : []);
  }
}
