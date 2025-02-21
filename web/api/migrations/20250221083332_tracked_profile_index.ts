import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_confirmed_last_updated
    ON tracked_profile (confirmed_at, last_updated_at);
  `)
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    DROP INDEX idx_confirmed_last_updated;
  `)
}

