import Knex from 'knex';
import { Player, BattleLog } from '~/model/Brawlstars';
import { LeaderboardEntry } from '~/model/Leaderboard';
import History, { PlayerHistoryEntry, BrawlerHistoryEntry } from '~/model/History';
import { MetaEntry } from '~/model/MetaEntry';

const dbUri = process.env.DATABASE_URI || '';

export default class DatabaseService {
  private knex: Knex;

  constructor() {
    this.knex = Knex(dbUri);
  }

  public shutdown() {
    this.knex.destroy();
  }

  public async store(entry: { player: Player, battleLog: BattleLog }) {
    const player = entry.player;
    const battleLog = entry.battleLog;
    const lastRecords = await this.knex
      .select('total_exp')
      .from('player')
      .where('tag', player.tag)
      .orderBy('timestamp', 'desc')
      .limit(1);

    if (lastRecords.length == 1) {
      if (player.totalExp == lastRecords[0].total_exp) {
        console.log(player.tag, 'most recent record is the same as submitted record, skipping');
        return;
      }
    }

    await this.knex.transaction(async (trx) => {
      const lastInsert = await trx('player').insert({
        name: player.name,
        tag: player.tag,
        club_name: player.club === null ? null : player.club.name,
        victories: player.victories,
        solo_showdown_victories: player.soloShowdownVictories,
        duo_showdown_victories: player.duoShowdownVictories,
        total_exp: player.totalExp,
        trophies: player.trophies,
        brawlers_unlocked: player.brawlersUnlocked,
      });
      const playerId = lastInsert[0];

      await Promise.all(player.brawlers.map((brawler) =>
        trx('player_brawler').insert({
          player_id: playerId,
          name: brawler.name,
          player_tag: player.tag,
          trophies: brawler.trophies,
          power: brawler.power,
        })
      ));
    });

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

  public async getHistory(tag: string) {
    const playerHistory = await this.knex
      .select('timestamp')
      .max('trophies as trophies', 'total_exp as total_exp')
      .from('player')
      .where('tag', tag)
      .andWhere('timestamp', '>=', this.knex.raw('now() - interval 1 week'))
      .groupBy('trophies', 'timestamp')
      .orderBy('timestamp', 'asc') as PlayerHistoryEntry[];
    const brawlerHistoryEntries = await this.knex
      .select('name', 'timestamp')
      .max('trophies as trophies')
      .from('player_brawler')
      .where('player_tag', tag)
      .andWhere('timestamp', '>=', this.knex.raw('now() - interval 1 month'))
      .groupBy('name', 'timestamp')
      .orderBy('timestamp', 'asc') as BrawlerHistoryEntry[];

    // filter duplicates by trophies in brawler history grouped by name
    const entriesAreSame =
      ({ name: nameA, trophies: trophiesA }: BrawlerHistoryEntry, { name: nameB, trophies: trophiesB }: BrawlerHistoryEntry) =>
        nameA == nameB && trophiesA == trophiesB
    const brawlerHistory = brawlerHistoryEntries.filter(
      (entryA, indexA, self) =>
        indexA == self.findIndex(
          (entryB) => entriesAreSame(entryA, entryB)
        )
    )

    return { playerHistory, brawlerHistory } as History;
  }

  public async getMeta() {
    return await this.knex.raw(`
      with brawler_history as (
        select
          *,
          row_number() over (partition by player_tag, name order by timestamp desc) as number,
          row_number() over (partition by player_tag, name order by timestamp asc) as number_rev
        from player_brawler
        where timestamp > now() - interval 1 week
      ),
      brawler_oldest as (
        select * from brawler_history where number = 1
      ),
      brawler_newest as (
        select * from brawler_history where number_rev = 1
      ),
      trophies_no_star_power as (
        select
          name,
          avg(trophies) as trophies,
          count(*) as sample
        from brawler_newest where power in (8, 9)
        group by name
      ),
      trophies_with_star_power as (
        select
          name,
          avg(trophies) as trophies,
          count(*) as sample
        from brawler_newest where power = 10
        group by name
      ),
      trophies_sum_old as (
        select
          name,
          sum(trophies) as trophies,
          sum(timestampdiff(hour, now(), timestamp)) as age_hours,
          count(*) as sample
        from brawler_newest
        where number <> 1
        group by name
      ),
      trophies_sum_new as (
        select
          name,
          sum(trophies) as trophies,
          sum(timestampdiff(hour, now(), timestamp)) as age_hours,
          count(*) as sample
        from brawler_oldest
        where number_rev <> 1
        group by name
      ),
      trophies_diff as (
        select
          n.name,
          (n.trophies - o.trophies) / n.sample as trophies,
          (n.age_hours - o.age_hours) / n.sample as age_hours,
          n.sample
        from trophies_sum_old o, trophies_sum_new n
        where o.name = n.name
      )
      select
        w.name,
        wo.trophies as trophies,
        w.trophies as sp_trophies,
        diff.trophies / diff.age_hours * 24 * 7 as trophies_diff_week
      from trophies_with_star_power w, trophies_no_star_power wo, trophies_diff diff
      where w.name = wo.name and w.name = diff.name
        `).then((response) => response[0].map(
          (entry: any) => (<MetaEntry> {
            name: entry.name,
            trophies: parseFloat(entry.trophies),
            spTrophies: parseFloat(entry.sp_trophies),
            trophyChange: parseFloat(entry.trophies_diff_week),
          })
        ));
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
        table.integer('brawlers_unlocked').unsigned().notNullable();

        table.index(['tag']);
      });
      console.log('created player table');
    }

    if (!await this.knex.schema.hasTable('player_brawler')) {
      await this.knex.schema.createTable('player_brawler', (table) => {
        table.bigIncrements('id');
        table.bigInteger('player_id').unsigned().notNullable();

        table.string('name').notNullable();
        table.string('player_tag').notNullable();

        table.integer('trophies').unsigned().notNullable();
        table.integer('power').unsigned().notNullable();

        table.index(['player_id']);
        table.index(['player_tag']);
        table.foreign('player_id').references('player.id');
      });
      console.log('created player_brawler table');
    }

    if (!await this.knex.schema.hasColumn('player', 'brawlers_unlocked')) {
      await this.knex.transaction(async (txn) => {
        await txn.schema.table('player', (table) => {
          table.integer('brawlers_unlocked').unsigned();
        });
        console.log('updated player');

        await txn.schema.table('player_brawler', (table) => {
          table.string('player_tag').notNullable().alter();
          table.bigInteger('player_id').unsigned();
          table.index(['player_id']);
          table.index(['player_tag']);
        });
        console.log('updated player_brawler');

        await txn.schema.raw(`
          update player_brawler pb
          join player p on pb.player_tag=p.tag
          and abs(timestampdiff(minute, p.timestamp, pb.timestamp)) < 1
          set pb.player_id=p.id, pb.timestamp=p.timestamp
        `);
        console.log('added player_brawler references');

        await txn.schema.raw(`
          update player p
          set brawlers_unlocked=(
            select count(*)
            from player_brawler pb
            where pb.player_id=p.id
          )
        `);
        console.log(`filled player.brawlers_unlocked`);

        await txn.schema.table('player', (table) => {
          table.integer('brawlers_unlocked').unsigned().notNullable().alter();
        });
        console.log('updated player');

        await txn.schema.table('player_brawler', (table) => {
          table.bigInteger('player_id').unsigned().notNullable().alter();
          table.foreign('player_id').references('player.id');
        });
        console.log('updated player_brawler');
      });
    }

    console.log('all migrations done');
  }
}
