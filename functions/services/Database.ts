import Knex from 'knex';
import { Player } from '~/model/Brawlstars';
import { LeaderboardEntry } from '~/model/Leaderboard';

const dbUri = process.env.DATABASE_URI || '';

export default class DatabaseService {
  private knex: Knex;

  constructor() {
    this.knex = Knex(dbUri);
  }

  public shutdown() {
    this.knex.destroy();
  }

  public async storeBrawlstarsRecord(player: Player) {
    const lastRecords = await this.knex
      .select('timestamp')
      .from('player')
      .where('tag', player.tag)
      .orderBy('timestamp', 'desc')
      .limit(1);

    if (lastRecords.length == 1) {
      if ((new Date().valueOf() - new Date(lastRecords[0].timestamp).valueOf()) / 36e5 < 1) {
        console.log(player.tag, 'most recent record is less than 1h old, skipping');
        return;
      }
    }

    await this.knex('player').insert({
      name: player.name,
      tag: player.tag,
      club_name: player.club === null ? null : player.club.name,
      victories: player.victories,
      solo_showdown_victories: player.soloShowdownVictories,
      duo_showdown_victories: player.duoShowdownVictories,
      total_exp: player.totalExp,
      trophies: player.trophies,
    });

    await Promise.all(player.brawlers.map((brawler) =>
      this.knex('player_brawler').insert({
        name: brawler.name,
        player_tag: player.tag,
        trophies: brawler.trophies,
        power: brawler.power,
      })
    ));

    console.log(player.tag, 'added record');
  }

  public async getTopByExp(n: number) {
    return await this.knex
      .select('name', 'tag')
      .max('total_exp as total_exp')
      .from('player')
      .groupBy('tag')
      .orderBy('total_exp', 'desc')
      .limit(n) as LeaderboardEntry[];
  }

  public async migrate() {
    if (!await this.knex.schema.hasTable('player')) {
      await this.knex.schema.createTable('player', (table) => {
        table.bigIncrements('id');

        table.timestamp('timestamp').notNullable().defaultTo(this.knex.fn.now());
        table.string('name').notNullable();
        table.string('tag').notNullable();
        table.string('club_name'); // nullable

        table.integer('victories').unsigned().notNullable();
        table.integer('solo_showdown_victories').unsigned().notNullable();
        table.integer('duo_showdown_victories').unsigned().notNullable();
        table.integer('total_exp').unsigned().notNullable();
        table.integer('trophies').unsigned().notNullable();

        table.index(['tag']);
      });
      console.log('created player table');
    }

    if (!await this.knex.schema.hasTable('player_brawler')) {
      await this.knex.schema.createTable('player_brawler', (table) => {
        table.bigIncrements('id');

        table.timestamp('timestamp').notNullable();
        table.string('name').notNullable();
        table.string('player_tag');

        table.integer('trophies').unsigned().notNullable();
        table.integer('power').unsigned().notNullable();
      })
      console.log('created player_brawler table');
    }

    console.log('all migrations done');
  }
}
