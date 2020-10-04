import { ClickHouse as ClickHouse2 } from 'clickhouse';
import { stripIndent } from "common-tags"
import Cube from './Cube'

export default abstract class MaterializedCube extends Cube {
  abstract engineDefinition: string
  abstract dimensionsDefinition: string
  abstract measuresDefinition: string
  abstract measuresQuery: string
  abstract seedQuery: string

  /**
   * Create a target table (`table`),
   * an insert trigger (`table_mv`)
   * and run a seed query if `table` is empty.
   */
  public async up(ch2: ClickHouse2) {
    await this.execute(ch2, stripIndent`
      CREATE TABLE IF NOT EXISTS ${this.table} (
        ${this.dimensionsDefinition},
        ${this.measuresDefinition}
      )
      ${this.engineDefinition}
    `)

    // mv column names must match table column names
    // errors are thrown on INSERT!
    await this.execute(ch2, stripIndent`
      CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.table}_mv
      TO ${this.table}
      AS ${this.seedQuery}
    `)

    const count = await this.execute<{ c: number }>(ch2, `SELECT COUNT() AS c FROM ${this.table}`)
    if (count[0].c == 0) {
      console.log(`populating ${this.table}`)
      await this.execute(ch2, `INSERT INTO ${this.table} ${this.seedQuery}`)
    }
  }
}
