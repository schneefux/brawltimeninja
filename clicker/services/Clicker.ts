import { ClickHouse as ClickHouse2 } from 'clickhouse';
import MapMetaCube from './cubes/MapMetaCube';
import GadgetMetaCube from './cubes/GadgetMetaCube';
import StarpowerMetaCube from './cubes/StarpowerMetaCube';
import LeaderboardCube from './cubes/LeaderboardCube';
import PlayerBrawlerCube from './cubes/PlayerBrawlerCube';
import PlayerBattleCube from './cubes/PlayerBattleCube';
import Materializer from './Materializer';

const dbHost = process.env.CLICKHOUSE_HOST || ''

export default class ClickerService {
  // readonly
  private chRo: ClickHouse2;
  // readwrite
  private chRw: ClickHouse2;

  /** @deprecated */
  private playerBrawlerCube: PlayerBrawlerCube
  /** @deprecated */
  private playerBattleCube: PlayerBattleCube
  /** @deprecated */
  private mapMetaCube: MapMetaCube
  /** @deprecated */
  private gadgetMetaCube: GadgetMetaCube
  /** @deprecated */
  private starpowerMetaCube: StarpowerMetaCube
  /** @deprecated */
  private leaderboardCube: LeaderboardCube

  constructor() {
    this.chRw = new ClickHouse2({
      url: dbHost,
      isSessionPerQuery: true,
    })
    // use 1 thread -> server can handle more queries
    // player queries take about 25% longer than with 4 threads
    this.chRo = new ClickHouse2({
      url: dbHost,
      config: {
        readonly: 1,
        max_threads: 1,
        output_format_json_quote_64bit_integers: 1,
        async_insert: 1,
        wait_for_async_insert: 1,
      },
      // clickhouse allows only a single query per session!
      isSessionPerQuery: true,
    })

    this.playerBrawlerCube = new PlayerBrawlerCube(this.chRo)
    this.playerBattleCube = new PlayerBattleCube(this.chRo)
    this.mapMetaCube = new MapMetaCube(this.chRo)
    this.gadgetMetaCube = new GadgetMetaCube(this.chRo)
    this.starpowerMetaCube = new StarpowerMetaCube(this.chRo)
    this.leaderboardCube = new LeaderboardCube(this.chRo)
  }

  public async migrate() {
    await this.chRw.query('CREATE DATABASE IF NOT EXISTS brawltime').toPromise()

    await this.playerBattleCube.up(this.chRw)
    await this.playerBrawlerCube.up(this.chRw)
    await this.mapMetaCube.up(this.chRw)
    await this.gadgetMetaCube.up(this.chRw)
    await this.starpowerMetaCube.up(this.chRw)
    await this.leaderboardCube.up(this.chRw)

    const materializer = new Materializer(this.chRo, this.chRw)
    await materializer.up()
  }
}
