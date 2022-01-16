import { Knex } from 'knex'
import { Model } from 'objection'

export class ReportModel extends Model {
  private created_at!: string
  private updated_at!: string

  static get tableName() {
    return 'report'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'title', 'width', 'height', 'widgets'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        title: { type: 'string' },
        width: { type: 'integer' },
        height: { type: 'integer' },
        widgets: { type: 'array' },
      },
    }
  }

  $beforeInsert() {
    this.created_at = new Date().toISOString();
    this.updated_at = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updated_at = new Date().toISOString()
  }
}

export async function migrate(db: Knex) {
  if (!await db.schema.hasTable('report')) {
    await db.schema.createTable('report', (table) => {
      table.increments('id').unsigned().primary()
      table.integer('user_id').unsigned().notNullable().references('user.id')
      table.datetime('created_at').notNullable().defaultTo(db.fn.now())
      table.datetime('updated_at').notNullable().defaultTo(db.fn.now())
      table.string('title').notNullable()
      table.integer('width').unsigned().notNullable()
      table.integer('height').unsigned().notNullable()
      table.json('widgets').notNullable()
    })
  }
}

