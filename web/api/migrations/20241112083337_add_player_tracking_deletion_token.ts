import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('tracked_profile', table => {
    table.uuid('deletion_token').notNullable().defaultTo(knex.fn.uuid());
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('tracked_profile', table => {
    table.dropColumn('deletion_token')
  })
}

