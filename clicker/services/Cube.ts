import ClickHouse from "@apla/clickhouse"
import Knex, { QueryBuilder } from "knex"
import { StatsD } from "hot-shots"
import { stripIndent } from "common-tags"

export type Aggregation = 'min'|'max'|'sum'|'count'|'avg'
export type Order = 'asc'|'desc'
export type DataType = 'string'|'int'|'float'|'bool'|((row: Record<string, string>) => any)

export default abstract class Cube<R> {
  abstract table: string
  abstract engineDefinition: string
  abstract dimensionsDefinition: string
  abstract measuresDefinition: string
  abstract measuresQuery: string
  abstract measuresAggregation: string
  abstract seedQuery: string

  abstract measures: Record<string, Aggregation>
  abstract dimensions: string[]
  abstract slices: Record<string, number>
  abstract mappers: Record<string, DataType>

  abstract slice(query: QueryBuilder, name: string, args: string[]): QueryBuilder

  private knex = Knex({ client: 'mysql' })
  private stats = new StatsD({ prefix: 'brawltime.clicker.' })

  private async execute(ch: ClickHouse, sql: string) {
    console.log('executing', sql)
    return await ch.querying(sql)
  }

  /**
   * Create a target table (`table`),
   * an insert trigger (`table_mv`),
   * run a seed query if `table` is empty,
   * and create a view for the target table (`table_v`).
   */
  public async up(ch: ClickHouse) {
    await this.execute(ch, stripIndent`
      CREATE TABLE IF NOT EXISTS ${this.table} (
        ${this.dimensionsDefinition},
        ${this.measuresDefinition}
      )
      ${this.engineDefinition}
    `)

    // mv column names must match table column names
    // errors are thrown on INSERT!
    // query from table (not from mview) or decimals are messed up (?)
    await this.execute(ch, stripIndent`
      CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.table}_mv
      TO ${this.table}
      AS ${this.seedQuery}
    `)

    const count = await ch.querying(`SELECT COUNT() AS c FROM ${this.table}`, { dataObjects: true })
    if (count.data[0].c == 0) {
      console.log(`populating ${this.table}`)
      await ch.querying(`INSERT INTO ${this.table} ${this.seedQuery}`)
    }

    await this.execute(ch, stripIndent`
      CREATE VIEW IF NOT EXISTS ${this.table}_v
      AS SELECT
       ${this.dimensions.join(',\n')},
       ${this.measuresAggregation}
      FROM ${this.table}
      GROUP BY ${this.dimensions.join(', ')}
    `)
  }

  public async query<N extends (keyof R)[], E extends (keyof R)[]>(
      ch: ClickHouse,
      name: string,
      measures: N|['*'],
      dimensions: E,
      slices: Partial<Record<string, string[]>> = {} as any,
      order: Partial<Record<keyof R, Order>> = {},
      limit?: number): Promise<Pick<R, N[number]|E[number]>[]> {
    if (measures.length == 1 && measures[0] == '*') {
      // TODO this destroys the return type!
      measures = Object.keys(this.measures) as any
    }

    let query = this.knex(this.table + '_v')
    const aggregateMode = dimensions.length > 0

    for (const dimension of dimensions) {
      if (!this.dimensions.includes(dimension as string)) {
        throw new Error('Invalid dimension: ' + dimension)
      }
      query = query
        .select(dimension)
        .groupBy(dimension)
    }

    for (const measure of (<string[]>measures).concat(Object.keys(order))) {
      if (dimensions.includes(measure as any)) {
        continue
      }
      if (this.dimensions.includes(measure) && !aggregateMode) {
        query = query.select(measure)
        continue
      }
      if (!(measure in this.measures)) {
        throw new Error('Invalid measure: ' + measure)
      }
      if (aggregateMode) {
        const method = this.measures[measure]
        const arg = { [measure]: measure }
        switch (method) {
          case 'min':
            query = query.min(arg)
            break
          case 'max':
            query = query.max(arg)
            break
          case 'sum':
            query = query.sum(arg)
            break
          case 'count':
            query = query.count(arg)
            break
          case 'avg':
            query = query.avg(arg)
            break
          default:
            throw new Error('Measure defined invalid aggregation method: ' + method)
        }
      } else {
        query = query.select(measure)
      }
    }

    for (const [orderColumn, orderDirection] of Object.entries(order)) {
      if (!['asc', 'desc'].includes(orderDirection as string)) {
        throw new Error('Invalid order direction: ' + orderDirection + ' for ' + orderColumn)
      }
      query = query.orderBy(orderColumn, orderDirection as string)
    }

    for (const [sliceName, sliceArgs] of Object.entries(slices)) {
      if (!(sliceName in this.slices)) {
        throw new Error('Invalid slice: ' + sliceName)
      }
      if ((<string[]>sliceArgs).length != this.slices[sliceName]) {
        throw new Error('Wrong number of slice args: ' + sliceArgs + ' for ' + sliceName)
      }
      query = this.slice(query, sliceName, <string[]>sliceArgs)
    }

    if (limit != undefined) {
      query = query.limit(limit)
    }

    const sql = query.toString()
    console.log('executing', sql)

    this.stats.increment(name + '.run')
    return this.stats.asyncTimer(() =>
      ch.querying(sql, { dataObjects: true, readonly: true })
        .then(rows => rows.data.map(r => this.parse<Pick<R, N[number]|E[number]>>(r)))
    , name + '.timer')()
  }

  private parse<P>(row: Record<string, string>) {
    const map = (column: string, value: string) => {
      const type = this.mappers[column]
      switch (type) {
        case 'string':
          return value
        case 'int':
          return parseInt(value)
        case 'float':
          return parseFloat(value)
        case 'bool':
          return value == '1'
        default:
          if (typeof type == 'function') {
            return type(row)
          }
          throw new Error('Could not map column: ' + column + ' ' + type)
      }
    }

    return Object.entries(row)
      .reduce((object, [key, value]) => ({
        ...object,
        [key]: map(key, value),
      }), {} as P)
  }
}
