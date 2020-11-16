import { ClickHouse as ClickHouse2 } from 'clickhouse';
import Knex, { QueryBuilder } from "knex"
import { StatsD } from "hot-shots"

export type Order = 'asc'|'desc'
export type DataType = 'string'|'int'|'float'|'bool'

export default abstract class Cube {
  abstract table: string
  abstract measures: Record<string, string>
  abstract dimensions: string[]
  abstract slices: Record<string, number>
  abstract mappers: Record<string, DataType>
  abstract virtuals: Record<string, string[]>
  abstract mapVirtual(row: Record<string, string>): Record<string, string|number|boolean>

  abstract slice(query: QueryBuilder, name: string, args: string[]): QueryBuilder

  private knex = Knex({ client: 'mysql' })
  private stats = new StatsD({ prefix: 'brawltime.clicker.' })

  public balanceChangesDate = new Date(Date.parse(process.env.BALANCE_CHANGES_DATE || '2020-07-01'))

  constructor(private ch: ClickHouse2) {
  }

  public async execute<T extends Record<string, string|number>>(ch2: ClickHouse2, sql: string): Promise<T[]> {
    console.log('executing', sql)
    return await ch2.query(sql).toPromise() as T[]
  }

  public abstract async up(ch2: ClickHouse2): Promise<void>

  private measureQuery(key: string) {
    return this.knex.raw(this.measures[key].replace(/\$TABLE/g, this.table))
  }

  public async query<R extends Record<string, string|number|boolean>>(
      name: string,
      measures: string[]|['*'],
      dimensions: string[],
      slices: Partial<Record<string, string[]>> = {} as any,
      order: Partial<Record<string, Order>> = {},
      limit?: number): Promise<{ data: R[], totals: R }> {
    if (measures.length == 1 && measures[0] == '*') {
      measures = Object.keys(this.measures)
    }

    // query from table (not from mview) or decimals are messed up (?)
    let query = this.knex(this.table)

    for (const dimension of dimensions) {
      if (!this.dimensions.includes(dimension as string)) {
        throw new Error('Invalid dimension: ' + dimension)
      }
      query = query
        .select(dimension)
        .groupBy(this.table + '.' + dimension)
    }

    for (const measure of measures) {
      if (measure in this.virtuals) {
        for (const m of this.virtuals[measure]) {
          query = query.select({ [m]: this.measureQuery(m) })
        }
        continue
      }
      if (!(measure in this.measures)) {
        if (this.dimensions.includes(measure)) {
          continue
        }
        throw new Error('Invalid measure: ' + measure)
      }

      query = query.select({ [measure]: this.measureQuery(measure) })
    }

    for (const [orderColumn, orderDirection] of Object.entries(order)) {
      if (!(orderColumn in this.measures)) {
        throw new Error('Invalid order column: ' + orderColumn)
      }
      if (!['asc', 'desc'].includes(orderDirection as string)) {
        throw new Error('Invalid order direction: ' + orderDirection + ' for ' + orderColumn)
      }

      if (!dimensions.includes(orderColumn)) {
        query = query.select({ [orderColumn]: this.measureQuery(orderColumn) })
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

    if (dimensions.length > 0) {
      query = query.groupByRaw('PLACEHOLDER')
    }

    const sql = query.toString().replace(', PLACEHOLDER', ' with totals')
    console.log('executing', sql)

    this.stats.increment(name + '.run')
    return this.stats.asyncTimer(() =>
      // ch2 has shitty typings
      ((this.ch.query(sql) as any).withTotals().toPromise() as Promise<{ data: Record<string, string>[], totals: Record<string, string>}>)
        .then(result => ({
          data: result.data.map(r => this.parse<R>(r)),
          totals: this.parse<R>(result.totals || {}),
        }))
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
          throw new Error('Could not map column: ' + column + ' ' + type)
      }
    }
    return {
      ...Object.entries(row)
        .reduce((object, [key, value]) => ({
          ...object,
          [key]: map(key, value),
        }), {} as P),
      ...this.mapVirtual(row),
    }
  }
}
