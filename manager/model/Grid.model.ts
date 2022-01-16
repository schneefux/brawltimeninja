import { Knex } from 'knex'
import { Model } from 'objection'

export class GridModel extends Model {
  private created_at!: string
  private updated_at!: string

  static get tableName() {
    return 'grid'
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'title', 'widgets'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        title: { type: 'string' },
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
  if (!await db.schema.hasTable('grid')) {
    await db.schema.createTable('grid', (table) => {
      table.integer('id').unsigned().primary()
      table.integer('user_id').unsigned().notNullable().references('user.id')
      table.datetime('created_at').notNullable().defaultTo(db.fn.now())
      table.datetime('updated_at').notNullable().defaultTo(db.fn.now())
      table.string('title').notNullable()
      table.json('widgets').notNullable()
    })
  }
}
