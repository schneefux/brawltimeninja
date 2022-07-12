import type { Knex } from 'knex'

const config: Record<string, Knex.Config> = {
  development: {
    client: 'mysql2',
    connection: {
      database: 'brawltime',
      user: 'brawltime',
      password: 'brawltime',
    },
  },

  production: {
    client: 'mysql2',
    connection: {
      database: 'brawltime',
      user: 'brawltime',
      password: 'brawltime',
    },
    pool: {
      min: 2,
      max: 10
    },
  },
}

export default config
