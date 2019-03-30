import { Player, PlayerIdentifier } from '../model/Player';
import Labels from '../model/Labels';
import Shard from '../model/Shard';

export default interface AppService {
  getLabels(): Labels;
  getShards(): Shard[];
  getFeaturedPlayers(): PlayerIdentifier[];
  getPlayerStatistics(shard: string, name: string): Promise<Player|null>;
}
