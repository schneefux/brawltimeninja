import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('survey_vote', (table) => {
    table.increments('id').primary()
    table.timestamp('timestamp').defaultTo(knex.fn.now())
    table.string('fingerprint').notNullable()
    table.string('tag').notNullable()
    table.string('mode').notNullable()
    table.string('best').notNullable()
    table.json('rest').notNullable()
    table.integer('player_trophies').notNullable()
    table.json('player_brawler_trophies').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('survey_vote')
}

