import { Knex } from 'knex'
import { Model, Pojo } from 'objection'

export class GridModel extends Model {
  private created_at!: Date
  private updated_at!: Date

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
        columns: { type: 'integer' },
        widgets: { type: 'array' },
      },
    }
  }

  $beforeInsert() {
    this.created_at = new Date()
    this.updated_at = new Date()
  }

  $beforeUpdate() {
    this.updated_at = new Date()
  }

  $parseJson(json: Pojo) {
    json = super.$parseJson(json)
    delete json['created_at']
    delete json['updated_at']
    return json
  }
}

export async function migrate(db: Knex) {
  if (!await db.schema.hasTable('grid')) {
    await db.schema.createTable('grid', (table) => {
      table.increments('id').unsigned().primary()
      table.integer('user_id').unsigned().notNullable().references('user.id')
      table.datetime('created_at').notNullable().defaultTo(db.fn.now())
      table.datetime('updated_at').notNullable().defaultTo(db.fn.now())
      table.string('title').notNullable()
      table.integer('columns').unsigned();
      table.json('widgets').notNullable()
    })
  }
}
