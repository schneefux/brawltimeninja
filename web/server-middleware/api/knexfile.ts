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
      host: process.env.MYSQL_HOST ?? 'localhost',
      port: parseInt(process.env.MYSQL_PORT ?? '3306'),
      database: process.env.MYSQL_DATABASE,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
    },
    pool: {
      min: 1,
      max: 10
    },
  },
}

export default config
