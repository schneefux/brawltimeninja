import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    CREATE INDEX IF NOT EXISTS idx_survey_vote_timestamp_best
    ON survey_vote (timestamp, best);
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    DROP INDEX idx_survey_vote_timestamp_best;
  `)
}

