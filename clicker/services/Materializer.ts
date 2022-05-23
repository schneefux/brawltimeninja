import { ClickHouse as ClickHouse2 } from 'clickhouse';
import { stripIndent } from 'common-tags';

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms))

export default class Materializer {
  constructor(
    private chRo: ClickHouse2,
    private chRw: ClickHouse2,
  ) {}

  async up() {
    const partitions = await this.chRo.query(`select distinct trophy_season_end, brawler_trophyrange from brawltime.battle order by trophy_season_end desc`).toPromise() as any[]
    const partitionsMapped = partitions.map(p => ({ trophy_season_end: p.trophy_season_end as string, brawler_trophyrange: p.brawler_trophyrange as string }))

    await this.upBrawlerAlliesMv(partitionsMapped)
    await this.upBrawlerEnemiesMv(partitionsMapped)
  }

  private async upBrawlerAlliesMv(partitions: { trophy_season_end: string, brawler_trophyrange: string }[]) {
    const exists = await this.chRo.query(`select count() as count from system.tables where database='brawltime' and table='brawler_allies_mv'`).toPromise() as any[]

    if (exists[0].count == 0) {
      const select = (where: string) => stripIndent`
        select
          trophy_season_end,
          brawler_name,
          brawler_id,
          brawler_trophyrange,
          battle_event_mode,
          battle_event_map,
          battle_event_id,
          battle_allies.brawler_name as ally_brawler_name,
          battle_allies.brawler_id as ally_brawler_id,
          toDecimal32(sum(battle_victory), 4) as battle_victory,
          count() as picks
        from brawltime.battle
        array join battle_allies
        ${where}
        group by trophy_season_end, brawler_name, brawler_id, brawler_trophyrange, battle_event_mode, battle_event_map, battle_event_id, ally_brawler_name, ally_brawler_id
      `

      const create = stripIndent`
        create materialized view brawltime.brawler_allies_mv
        engine = SummingMergeTree()
        partition by trophy_season_end
        primary key (brawler_name, brawler_id, brawler_trophyrange)
        order by (brawler_name, brawler_id, brawler_trophyrange, battle_event_mode, battle_event_map, battle_event_id, ally_brawler_name, ally_brawler_id)
        as ${select('')}
      `

      console.log('executing', create)
      await this.chRw.query(create).toPromise()

      for (const partitionValue of partitions) {
        const insert = stripIndent`
          insert into brawltime.brawler_allies_mv
          ${select(`where trophy_season_end = '${partitionValue.trophy_season_end}' and brawler_trophyrange = '${partitionValue.brawler_trophyrange}'`)}
        `

        console.log('executing', insert)
        while (true) {
          try {
            await this.chRw.query(insert).toPromise()
            break
          } catch (err) {
            console.error(err)
            await sleep(60000)
          }
        }
      }
    }
  }

  private async upBrawlerEnemiesMv(partitions: { trophy_season_end: string, brawler_trophyrange: string }[]) {
    const exists = await this.chRo.query(`select count() as count from system.tables where database='brawltime' and table='brawler_enemies_mv'`).toPromise() as any[]

    if (exists[0].count == 0) {
      const select = (where: string) => stripIndent`
        select
          trophy_season_end,
          brawler_name,
          brawler_id,
          brawler_trophyrange,
          battle_event_mode,
          battle_event_map,
          battle_event_id,
          battle_enemies.brawler_name as enemy_brawler_name,
          battle_enemies.brawler_id as enemy_brawler_id,
          toDecimal32(sum(battle_victory), 4) as battle_victory,
          count() as picks
        from brawltime.battle
        array join battle_enemies
        ${where}
        group by trophy_season_end, brawler_name, brawler_id, brawler_trophyrange, battle_event_mode, battle_event_map, battle_event_id, enemy_brawler_name, enemy_brawler_id
      `

      const create = stripIndent`
        create materialized view brawltime.brawler_enemies_mv
        engine = SummingMergeTree()
        partition by trophy_season_end
        primary key (brawler_name, brawler_id, brawler_trophyrange)
        order by (brawler_name, brawler_id, brawler_trophyrange, battle_event_mode, battle_event_map, battle_event_id, enemy_brawler_name, enemy_brawler_id)
        as ${select('')}
      `

      console.log('executing', create)
      await this.chRw.query(create).toPromise()

      for (const partitionValue of partitions) {
        const insert = stripIndent`
          insert into brawltime.brawler_enemies_mv
          ${select(`where trophy_season_end = '${partitionValue.trophy_season_end}' and brawler_trophyrange = '${partitionValue.brawler_trophyrange}'`)}
        `

        console.log('executing', insert)
        while (true) {
          try {
            await this.chRw.query(insert).toPromise()
            break
          } catch (err) {
            console.error(err)
            await sleep(60000)
          }
        }
      }
    }
  }
}
