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
    const battleLog = entry.battleLog.items;
    if (battleLog.length == 0) {
      console.error('battle log is empty, aborting!!!', player.tag);
    }

    /** Parse broken API time format */
    const parseTime = (time: string) => new Date(Date.parse(time));
    const parseApiTime = (time: string) => {
      const t = parseTime(`${time.slice(0, 4)}-${time.slice(4, 6)}-${time.slice(6, 8)}T${time.slice(9, 11)}:${time.slice(11, 13)}:${time.slice(13)}`)
      t.setHours(t.getHours() + 8);
      return t;
    };

    // get timestamp of last battle
    battleLog.sort((b1, b2) => parseApiTime(b2.battleTime).valueOf() - parseApiTime(b1.battleTime).valueOf());
    const lastBattle = battleLog[0];
    const lastBattleTime = parseApiTime(lastBattle.battleTime);

    await this.knex.transaction(async (trx) => {
      console.time('add player record');
      const lastPlayerRecord = await trx
        .select('timestamp')
        .from('player')
        .where('tag', player.tag)
        .orderBy('timestamp', 'desc')
        .limit(1);
      const lastPlayerTime = lastPlayerRecord.length == 0 ? new Date(0) : parseTime(lastPlayerRecord[0].timestamp);

      // insert a player record that has the timestamp of the last battle played
      if (lastBattleTime > lastPlayerTime) {
        const lastInsert = await trx('player').insert({
          timestamp: lastBattleTime,
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
            timestamp: lastBattleTime,
            player_id: playerId,
            name: brawler.name,
            player_tag: player.tag,
            trophies: brawler.trophies,
            power: brawler.power,
          })
        ));

        console.log('added player record', player.tag, playerId);
      }
      console.timeEnd('add player record');

      console.time('add battle records');

      await Promise.all(battleLog.map(async (battle) => {
        const battleTime = parseApiTime(battle.battleTime);
        const teamsWithoutBigBrawler = (battle.battle.teams !== undefined ? battle.battle.teams : battle.battle.players.map((p) => [p]));
        const teams = battle.battle.bigBrawler !== undefined ? teamsWithoutBigBrawler.concat([[battle.battle.bigBrawler]]) : teamsWithoutBigBrawler;
        const playerTagsCsv = teams
          .map((players) => players.map(({ tag }) => tag.replace('#', '')))
          .reduce((agg, cur) => agg.concat(cur), [])
          .sort()
          .reduce((agg, cur) => agg.length > 0 ? `${agg},${cur}` : cur, '');

        // try to find a battle with the same configuration
        // and same players within +/- 5 min
        const battleRecord = await trx
          .select('id')
          .from('battle')
          .whereRaw('abs(timestampdiff(minute, timestamp, ?)) < 5', [battleTime])
          .andWhere('player_tags', playerTagsCsv)
          .andWhere('event_id', battle.event.id)
          .andWhere('event_mode', battle.event.mode);

        if (battleRecord.length == 0) {
          // battle was not registered yet

          const battleRecord = await trx('battle').insert({
            /* id, */
            timestamp: parseApiTime(battle.battleTime),
            player_tags: playerTagsCsv,
            event_id: battle.event.id,
            event_mode: battle.event.mode,
            event_map: battle.event.map,
            type: battle.battle.type || null,
          })
          const battleId = battleRecord[0];

          await Promise.all(teams.map((insertPlayers, teamIndex) =>
            Promise.all(insertPlayers.map((insertPlayer, playerIndex) => {
              const is3v3 = teams.length == 2 && teams[0].length == 3 && teams[1].length == 3;
              const isMe = insertPlayer.tag.replace('#', '') == player.tag;
              const isMyTeam = insertPlayers.find((p) => p.tag == insertPlayer.tag) !== undefined;
              const flippedResult = battle.battle.result == 'draw' ? 'draw' : (battle.battle.result == 'victory' ? 'defeat' : 'victory');

              return trx('player_battle').insert({
                /* id, */
                timestamp: battleTime,
                is_complete: isMe,
                brawler_id: insertPlayer.brawler.id,
                brawler_name: insertPlayer.brawler.name,
                battle_id: battleId,
                player_tag: insertPlayer.tag.replace('#', ''),
                player_name: insertPlayer.name,
                player_index: playerIndex,
                team_index: teamIndex,
                brawler_trophies: insertPlayer.brawler.trophies,
                brawler_power: insertPlayer.brawler.power,
                is_starplayer: battle.battle.starPlayer !== undefined ? battle.battle.starPlayer.tag == insertPlayer.tag : undefined,
                is_bigbrawler: battle.event.mode == 'bigGame' ? battle.battle.bigBrawler.tag == insertPlayer.tag : undefined,
                result: !is3v3 ? undefined : (isMyTeam ? battle.battle.result : flippedResult),
                duration: battle.battle.duration,
                rank: !isMe ? undefined : battle.battle.rank,
                trophy_change: !isMe ? undefined : battle.battle.trophyChange,
                battle_event_id: battle.event.id,
                battle_event_mode: battle.event.mode,
                battle_event_map: battle.event.map,
                battle_type: battle.battle.type || null,
              })
            }))
          ));

          console.log('added battle record', player.tag, battleId);
        } else {
          // battle exists - find the matching player_battle record
          const playerBattleRecord = await trx
            .select('is_complete', 'id')
            .from('player_battle')
            .where('battle_id', battleRecord[0].id)
            .andWhere('player_tag', player.tag);

          if (!playerBattleRecord[0].is_complete) {
            // battle was registered, but by another player
            // so it is missing some data - update trophy_change and rank
            await trx('player_battle')
              .where('id', playerBattleRecord[0].id)
              .update({
                timestamp: battleTime, // end time is different for players in showdown
                is_complete: true,
                trophy_change: battle.battle.trophyChange,
                rank: battle.battle.rank,
              });

            console.log('updated player battle record', player.tag, playerBattleRecord[0].id);
          }
        }
      }));

      console.timeEnd('add battle records');
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
      // TODO
      // ALTER DATABASE brawltime COLLATE = 'utf8_unicode_ci';

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

    if (!await this.knex.schema.hasTable('battle')) {
      await this.knex.schema.createTable('battle', (table) => {
        table.bigIncrements('id');

        table.timestamp('timestamp').notNullable().defaultTo(0);
        table.string('player_tags').notNullable(); // sorted CSV

        // duplicated in player_battle
        table.integer('event_id').notNullable();
        table.string('event_mode').notNullable();
        table.string('event_map').notNullable();
        table.string('type');

        table.unique(['player_tags', 'timestamp']); // team plays only one game at a time
      });
      console.log('created battle');

      await this.knex.schema.createTable('player_battle', (table) => {
        table.bigIncrements('id');

        table.timestamp('timestamp').notNullable().defaultTo(0);
        table.bigInteger('battle_id').unsigned().notNullable();
        // true if player-private data is included
        table.boolean('is_complete').notNullable();

        table.integer('brawler_id').notNullable();
        table.string('brawler_name').notNullable();
        table.string('player_tag').notNullable();
        table.string('player_name').notNullable();
        table.integer('player_index').notNullable();
        table.integer('team_index').notNullable();

        table.integer('brawler_trophies');
        table.integer('brawler_power');
        table.boolean('is_starplayer');
        table.boolean('is_bigbrawler');
        table.string('result');
        table.integer('duration');
        table.integer('rank');
        table.integer('trophy_change');

        // battle attributes
        table.integer('battle_event_id').notNullable();
        table.string('battle_event_mode').notNullable();
        table.string('battle_event_map').notNullable();
        table.string('battle_type');

        table.unique(['battle_id', 'player_tag']); // player plays once
        table.unique(['player_tag', 'timestamp']); // player plays one game at a time
        table.foreign('battle_id').references('battle.id');
      });
      console.log('created player_battle');
    }

    console.log('all migrations done');
  }
}
