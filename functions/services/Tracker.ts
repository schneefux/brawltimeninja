import Knex from 'knex';
import { Player, BattleLog } from '~/model/Brawlstars';
import { LeaderboardEntry } from '~/model/Leaderboard';
import History, { PlayerHistoryEntry, BrawlerHistoryEntry } from '~/model/History';
import { MetaEntry, MetaModeEntry } from '~/model/MetaEntry';

const dbUri = process.env.DATABASE_URI || '';

export default class TrackerService {
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

    // insert records for progress graphs
    await this.knex.transaction(async (trx) => {
      console.time('add player record ' + player.tag);
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
          club_tag: player.club === null ? null : player.club.tag,
          victories: player["3vs3Victories"],
          solo_showdown_victories: player.soloVictories,
          duo_showdown_victories: player.duoVictories,
          total_exp: player.expPoints,
          trophies: player.trophies,
          brawlers_unlocked: player.brawlers.length,
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
            starpower1_id: brawler.starPowers.length == 0 ? null : brawler.starPowers[0].id,
            starpower1_name: brawler.starPowers.length == 0 ? null : brawler.starPowers[0].name,
            starpower2_id: brawler.starPowers.length <= 1 ? null : brawler.starPowers[1].id,
            starpower2_name: brawler.starPowers.length <= 1 ? null : brawler.starPowers[1].name,
          })
        ));

        console.log('added player record', player.tag, playerId);
      }

      console.timeEnd('add player record ' + player.tag);
    });

    // do not await - process in background and resolve early
    // insert records for meta stats
    Promise.all(battleLog.map(async (battle) => {
      await this.knex.transaction(async (trx) => {
        console.time('add battle record ' + player.tag + ' ' + battle.battleTime);

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
          .andWhere('event_id', battle.event.id);

        if (battleRecord.length == 0) {
          // battle was not registered yet

          const battleRecord = await trx('battle').insert({
            /* id, */
            timestamp: battleTime,
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
              const isMyTeam = insertPlayers.some((p) => p.tag.replace('#', '') == player.tag);
              const flippedResult = battle.battle.result == 'draw' ? 'draw' : (battle.battle.result == 'victory' ? 'defeat' : 'victory');
              const myBrawler = !isMe ? undefined : player.brawlers.find((b) => b.name == insertPlayer.brawler.name);
              const myStarpower = myBrawler === undefined || myBrawler.starPowers.length != 1 ? undefined : myBrawler.starPowers[0];

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
                starpower_found: myStarpower !== undefined,
                starpower_id: myStarpower === undefined ? null : myStarpower.id,
                starpower_name: myStarpower === undefined ? null : myStarpower.name,
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

        console.timeEnd('add battle record ' + player.tag + ' ' + battle.battleTime);
      });
    }));
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

  public async getBrawlerMeta() {
    return await this.knex.raw(`
        select
          dim_brawler_starpower.brawler_name as name,
          sum(cur.trophies) / sum(cur.trophies_count) as trophies,
          sum(cur.trophies) / sum(cur.trophies_count) - sum(prev.trophies) / sum(prev.trophies_count) as diff,
          sum(cur.count) as picks,
          sum(cur.victory) / sum(cur.result_count) as win_rate,
          sum(cur.starplayer) / sum(cur.starplayer_count) as star_rate
        from agg_player_battle cur
        join dim_brawler_starpower on dim_brawler_starpower.id = brawler_starpower_id
        join dim_season on dim_season.id = season_id
        join agg_player_battle prev on prev.brawler_starpower_id = cur.brawler_starpower_id and prev.season_id = cur.season_id - 2
        where is_current
        group by dim_brawler_starpower.brawler_name
      `).then((response) => response[0].map(
        (entry: any) => (<MetaEntry> {
          name: entry.name,
          trophies: parseFloat(entry.trophies),
          trophyChange: parseFloat(entry.diff),
          winRate: parseFloat(entry.win_rate),
          starRate: parseFloat(entry.star_rate),
          picks: parseInt(entry.picks),
        })
      ));
    }

    public async getMapMeta() {
      return await this.knex.raw(`
        select
          dim_event.id as id,
          dim_event.mode as mode,
          dim_event.map as map,
          dim_brawler_starpower.brawler_name as name,
          is_bigbrawler,

          sum(count) as picks,
          sum(duration) / sum(duration_count) as duration,
          sum(rank_1) as rank_1,
          sum(rank) / sum(rank_count) as rank,
          sum(victory) as wins,
          sum(starplayer) / sum(starplayer_count) as star_rate
        from agg_player_battle
        join dim_event on dim_event.id = event_id
        join dim_brawler_starpower on dim_brawler_starpower.id = brawler_starpower_id
        join dim_season on dim_season.id = season_id
        where is_current
        group by id, mode, map, name, is_bigbrawler
      `)
        .then((response) => response[0].map(
        (entry: any) => (<MetaModeEntry> {
          id: entry.id,
          mode: entry.mode,
          map: entry.map,
          name: entry.name,
          isBigbrawler: entry.is_bigbrawler,
          duration: parseFloat(entry.duration),
          wins: parseInt(entry.wins),
          rank1: parseInt(entry.rank_1),
          rank: parseFloat(entry.rank),
          starRate: parseFloat(entry.star_rate),
          picks: parseInt(entry.picks),
        })
      ));
    }

    public async migrate() {
      // alter database brawltime collate = 'utf8mb4_unicode_ci';
      // alter table player_brawler convert to character set utf8mb4 collate utf8mb4_unicode_ci;

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

        table.timestamp('timestamp').notNullable();
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

        table.timestamp('timestamp').nullable();
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

        table.timestamp('timestamp').nullable();
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

    if (!await this.knex.schema.hasColumn('player', 'club_tag')) {
      await this.knex.transaction(async (txn) => {
        await txn.schema.table('player', (table) => {
          table.string('club_tag');
        });
        console.log('updated player');

        await txn.schema.alterTable('player_brawler', (table) => {
          table.timestamp('timestamp').notNullable().defaultTo(this.knex.fn.now()).alter();
        });

        await txn.schema.raw(`
          update player_brawler b set name=upper(name)
        `);
        console.log(`converted player_brawler.name to upper case`);
      });
    }

    if (!await this.knex.schema.hasTable('agg_player_battle')) {
      await this.knex.transaction(async (txn) => {
        await txn.schema.createTable('dim_event', (table) => {
          table.integer('id').unsigned().primary();

          table.string('mode');
          table.string('map');

          table.unique(['mode', 'map']);
        });
        console.log('created event dimension');

        await txn.schema.createTable('dim_brawler_starpower', (table) => {
          table.integer('id').unsigned().primary(); // coalesce(starpower_id, brawler_id)

          table.integer('brawler_id').unsigned().notNullable();
          table.string('brawler_name').notNullable();

          table.integer('starpower_id').notNullable();
          table.string('starpower_name').notNullable();

          table.index(['starpower_id']);
          table.index(['brawler_id']);
        });
        console.log('created brawler_starpower dimension');

        await txn.schema.createTable('dim_season', (table) => {
          table.integer('id').unsigned().primary();

          table.timestamp('end').nullable();
          table.boolean('is_current').notNullable();

          table.unique(['end']);
        });
        console.log('created season dimension');

        await txn.schema.createTable('meta_last_processed', (table) => {
          table.string('name').primary();
          table.bigInteger('last_id').unsigned();
        });
        console.log('created meta table');

        await txn.schema.table('player_brawler', (table) => {
          table.integer('starpower1_id').nullable();
          table.integer('starpower2_id').nullable();
          table.string('starpower1_name').nullable();
          table.string('starpower2_name').nullable();
        });
        console.log('updated player_brawler');

        await txn.schema.table('player_battle', (table) => {
          table.boolean('starpower_found').defaultTo(false);
          table.integer('starpower_id').nullable();
          table.string('starpower_name').nullable();
        });
        console.log('updated player_battle');

        await txn.schema.createTable('agg_player_battle', (table) => {
          table.bigIncrements('id');

          // dimensions
          table.integer('season_id').unsigned().notNullable();
          table.integer('event_id').unsigned().notNullable();
          table.integer('brawler_starpower_id').unsigned().notNullable();
          table.boolean('is_bigbrawler').notNullable();

          // metrics
          table.bigInteger('count').notNullable().unsigned();
          table.bigInteger('count_complete').notNullable().unsigned();
          table.bigInteger('duration').notNullable().unsigned();
          table.bigInteger('duration_count').notNullable().unsigned();
          table.bigInteger('rank_1').notNullable().unsigned();
          table.bigInteger('rank').notNullable().unsigned();
          table.bigInteger('rank_count').notNullable().unsigned();
          table.bigInteger('victory').notNullable().unsigned();
          table.bigInteger('defeat').notNullable().unsigned();
          table.bigInteger('draw').notNullable().unsigned();
          table.bigInteger('result_count').notNullable().unsigned();
          table.bigInteger('starplayer').notNullable().unsigned();
          table.bigInteger('starplayer_count').notNullable().unsigned();
          table.bigInteger('trophies').notNullable().unsigned();
          table.bigInteger('trophies_count').notNullable().unsigned();
          table.bigInteger('power').notNullable().unsigned();
          table.bigInteger('power_count').notNullable().unsigned();

          table.unique(['season_id', 'brawler_starpower_id', 'is_bigbrawler', 'event_id'], 'idx_unq_dimensions');
          table.foreign('season_id').references('dim_season.id');
          table.foreign('event_id').references('dim_event.id');
          table.foreign('brawler_starpower_id').references('dim_brawler_starpower.id');
        });
        console.log('created aggregation table');
      });
    }

    console.log('all migrations done');
  }

  private async fillDimEvent(txn: Knex.Transaction) {
    const lastIdRecords = await txn('meta_last_processed')
      .select('last_id')
      .where({ 'name': 'dim_event' });
    const lastProcessedId = lastIdRecords.length > 0 ? lastIdRecords[0].last_id : 0;
    const lastId = (await txn('battle').max('id as id'))[0].id;
    console.time('fill dim_event');

    await txn.raw(`
      insert ignore dim_event
        select distinct
          event_id as id,
          event_mode as mode,
          event_map as map
        from battle
        where id > ? and id <= ?
    `, [lastProcessedId, lastId]);

    if (lastIdRecords.length === 0) {
      await txn('meta_last_processed')
        .insert({ 'name': 'dim_event', 'last_id': lastId });
    } else {
      await txn('meta_last_processed')
        .where({ 'name': 'dim_event' })
        .update({ 'last_id': lastId });
    }
    console.timeEnd('fill dim_event');
  }

  private async fillDimBrawlerStarpower(txn: Knex.Transaction) {
    const lastIdRecords = await txn('meta_last_processed')
      .select('last_id')
      .where({ 'name': 'dim_brawler_starpower' });
    const lastProcessedId = lastIdRecords.length > 0 ? lastIdRecords[0].last_id : 0;
    const lastId = (await txn('player_battle').max('id as id'))[0].id;
    console.time('fill dim_brawler_starpower');

    await txn.raw(`
      insert ignore dim_brawler_starpower
        select distinct
          coalesce(starpower_id, brawler_id) as id,
          brawler_id,
          brawler_name,
          coalesce(starpower_id, 0),
          coalesce(starpower_name, '')
        from player_battle
        where id > ? and id <= ?
    `, [lastProcessedId, lastId]);

    if (lastIdRecords.length === 0) {
      await txn('meta_last_processed')
        .insert({ 'name': 'dim_brawler_starpower', 'last_id': lastId });
    } else {
      await txn('meta_last_processed')
        .where({ 'name': 'dim_brawler_starpower' })
        .update({ 'last_id': lastId });
    }
    console.timeEnd('fill dim_brawler_starpower');
  }

  private sqlRoundTimestampToSeasonEnd = `
    date_add(from_days(
      ceil(to_days(
          date_sub(
            date_sub(timestamp, interval 8 hour),
          interval 1 day)
      ) / 14) * 14 + 2
    ), interval 8 hour)
  `;

  private async fillDimSeason(txn: Knex.Transaction) {
    const lastIdRecords = await txn('meta_last_processed')
      .select('last_id')
      .where({ 'name': 'dim_season' });
    const lastProcessedId = lastIdRecords.length > 0 ? lastIdRecords[0].last_id : 0;
    const lastId = (await txn('battle').max('id as id'))[0].id;
    console.time('fill dim_season');

    await txn.raw(`
      insert ignore dim_season
        select distinct
          yearweek(${this.sqlRoundTimestampToSeasonEnd}) as id,
          ${this.sqlRoundTimestampToSeasonEnd} as end,
          now() <= ${this.sqlRoundTimestampToSeasonEnd} as is_current
        from battle
        where id > ? and id <= ?
        on duplicate key update
          is_current = values(is_current)
    `, [lastProcessedId, lastId]);

    if (lastIdRecords.length === 0) {
      await txn('meta_last_processed')
        .insert({ 'name': 'dim_season', 'last_id': lastId });
    } else {
      await txn('meta_last_processed')
        .where({ 'name': 'dim_season' })
        .update({ 'last_id': lastId });
    }
    console.timeEnd('fill dim_season');
  }

  /** aggregate player_battle facts */
  private async fillAggPlayerBattle(txn: Knex.Transaction) {
    const lastIdRecords = await txn('meta_last_processed')
      .select('last_id')
      .where({ 'name': 'agg_player_battle' });
    const lastProcessedId = lastIdRecords.length > 0 ? lastIdRecords[0].last_id : 0;
    const lastId = Math.min(
      (await txn('player_battle').max('id as id'))[0].id,
      lastProcessedId + 100000 // save memory
    );
    console.time('materialize from ' + lastProcessedId + ' to ' + lastId);

    await txn.raw(`
      insert agg_player_battle
        select
          null,
          dim_season.id as season_id,
          battle_event_id as event_id,
          coalesce(starpower_id, brawler_id) as brawler_starpower_id,
          coalesce(is_bigbrawler, false) as is_bigbrawler,

          count(*) as count,
          sum(is_complete) as count_complete,
          coalesce(sum(duration), 0) as duration,
          sum(duration is not null) as duration_count,
          coalesce(sum(rank=1), 0) as rank_1,
          coalesce(sum(rank), 0) as rank,
          sum(rank is not null) as rank_count,
          coalesce(sum(result='victory'), 0) as victory,
          coalesce(sum(result='defeat'), 0) as defeat,
          coalesce(sum(result='draw'), 0) as draw,
          sum(result is not null) as result_count,
          coalesce(sum(is_starplayer), 0) as starplayer,
          sum(is_starplayer is not null) as starplayer_count,
          coalesce(sum(brawler_trophies), 0) as trophies,
          sum(brawler_trophies is not null) as trophies_count,
          coalesce(sum(brawler_power), 0) as power,
          sum(brawler_power is not null) as power_count
        from player_battle
        join dim_season on end=${this.sqlRoundTimestampToSeasonEnd}
        where player_battle.id > ? and player_battle.id <= ?
        group by season_id, event_id, brawler_starpower_id, is_bigbrawler
      on duplicate key update
        count = count + values(count),
        count_complete = count_complete + values(count_complete),
        duration = duration + values(duration),
        duration_count = duration_count + values(duration_count),
        rank_1 = rank_1 + values(rank_1),
        rank = rank + values(rank),
        rank_count = rank_count + values(rank_count),
        victory = victory + values(victory),
        defeat = defeat + values(defeat),
        draw = draw + values(draw),
        result_count = result_count + values(result_count),
        starplayer = starplayer + values(starplayer),
        starplayer_count = starplayer_count + values(starplayer_count),
        trophies = trophies + values(trophies),
        trophies_count = trophies_count + values(trophies_count),
        power = power + values(power),
        power_count = power_count + values(power_count)
    `, [lastProcessedId, lastId]);

    if (lastIdRecords.length === 0) {
      await txn('meta_last_processed')
        .insert({ 'name': 'agg_player_battle', 'last_id': lastId });
    } else {
      await txn('meta_last_processed')
        .where({ 'name': 'agg_player_battle' })
        .update({ 'last_id': lastId });
    }

    console.timeEnd('materialize from ' + lastProcessedId + ' to ' + lastId);
  }

  public async materialize() {
    await this.knex.transaction(async (txn) => {
      await this.fillDimEvent(txn);
      await this.fillDimSeason(txn);
      await this.fillDimBrawlerStarpower(txn);
      await this.fillAggPlayerBattle(txn);
    });
  }
}
