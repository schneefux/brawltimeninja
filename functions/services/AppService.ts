import { Player, PlayerIdentifier } from '../model/Player';
import Labels from '../model/Labels';

export default interface AppService {
  getLabels(): Labels;
  getFeaturedPlayers(): PlayerIdentifier[];
  getPlayerStatistics(playerid: string): Promise<Player|null>;
}