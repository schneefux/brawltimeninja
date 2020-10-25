cube('PlayerMaxBrawlers', {
  refreshKey: {
    every: '60 minutes',
  },
  sql: 'SELECT * FROM brawltime.brawler_leaderboard',
  rewriteQueries: true,

  measures: {
    brawler_highest_trophies: {
      sql: 'brawler_highest_trophies',
      type: 'max',
    },

    player_name: {
      sql: 'any(player_name)',
      type: 'number',
    },
    player_icon_id: {
      sql: 'any(player_icon_id)',
      type: 'number',
    },
    brawler_name: {
      sql: 'any(brawler_name)',
      type: 'number',
    },
  },

  dimensions: {
    timestamp: {
      sql: 'timestamp',
      type: 'time',
    },
    player_id: {
      sql: 'player_id',
      type: 'number',
    },
    brawler_id: {
      sql: 'brawler_id',
      type: 'number',
    },
  },
})
