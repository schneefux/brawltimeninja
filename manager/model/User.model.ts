import { Knex } from 'knex'
import { Model } from 'objection'
import { GridModel } from './Grid.model.js'
import { ReportModel } from './Report.model.js'

export class UserModel extends Model {
  static get tableName() {
    return 'user'
  }

  static get relationMappings() {
    return {
      grids: {
        relation: Model.HasManyRelation,
        modelClass: GridModel,
        join: {
          from: 'user.id',
          to: 'grid.user_id'
        },
      },
      reports: {
        relation: Model.HasManyRelation,
        modelClass: ReportModel,
        join: {
          from: 'user.id',
          to: 'report.user_id'
        },
      },
    }
  }

  static get jsonSchema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        googleId: { type: 'string' },
      },
    }
  }
}

export async function migrate(db: Knex) {
  if (!await db.schema.hasTable('user')) {
    await db.schema.createTable('user', (table) => {
      table.integer('id').unsigned().primary()
      table.string('googleId').unique()
    })
  }
}
