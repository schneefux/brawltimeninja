import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('tracked_profile', (table) => {
    table.string('tag').primary()
    table.datetime('created_at').notNullable()
    table.datetime('confirmed_at').notNullable()
    table.datetime('last_updated_at').notNullable()
    table.datetime('last_active_at').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('tracked_profile')
}
