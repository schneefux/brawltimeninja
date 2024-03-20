import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('map_report', (table) => {
    table.increments('id').primary()
    table.string('locale_iso').notNullable()
    table.string('mode').notNullable()
    table.string('map').notNullable()
    table.datetime('timestamp').notNullable()
    table.text('prompt').notNullable()
    table.text('completion').notNullable()
    table.index(['locale_iso', 'mode', 'map'])
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('map_report')
}
