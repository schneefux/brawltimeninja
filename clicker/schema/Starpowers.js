cube('Starpowers', {
  refreshKey: {
    every: '10 minutes',
  },
  sql: 'SELECT * FROM brawltime.starpower_meta',
  rewriteQueries: true,

  measures: {
    brawler_id_any: {
      sql: 'any(brawler_id)',
      type: 'number',
    },
    brawler_name_any: {
      sql: 'any(brawler_name)',
      type: 'number',
    },
    brawler_starpower_id_any: {
      sql: 'any(brawler_starpower_id)',
      type: 'number',
    },
    brawler_starpower_name_any: {
      sql: 'any(brawler_starpower_name)',
      type: 'number',
    },
    timestamp: {
      sql: 'argMaxMerge(timestamp_state)',
      type: 'number',
    },
    picks: {
      sql: 'picks',
      type: 'sum',
    },
    picks_weighted: {
      sql: 'picks_weighted',
      type: 'sum',
    },
    battle_duration: {
      sql: 'avgMerge(battle_duration_state)',
      type: 'number',
    },
    battle_rank: {
      sql: 'avgMerge(battle_rank_state)',
      type: 'number',
    },
    battle_rank1: {
      sql: 'avgMerge(battle_rank1_state)',
      type: 'number',
    },
    battle_victory: {
      sql: 'avgMerge(battle_victory_state)',
      type: 'number',
    },
    battle_starplayer: {
      sql: 'avgMerge(battle_starplayer_state)',
      type: 'number',
    },
    battle_level: {
      sql: 'avgMerge(battle_level_state)',
      type: 'number',
    },
    battle_trophy_change: {
      sql: 'avgMerge(battle_trophy_change_state)',
      type: 'number',
    },
  },

  dimensions: {
    trophy_season_end: {
      sql: 'trophy_season_end',
      type: 'time',
    },
    brawler_trophyrange: {
      sql: 'brawler_trophyrange',
      type: 'number',
    },
    brawler_id: {
      sql: 'brawler_id',
      type: 'number',
    },
    brawler_name: {
      sql: 'brawler_name',
      type: 'string',
    },
    brawler_starpower_id: {
      sql: 'brawler_starpower_id',
      type: 'number',
    },
    brawler_starpower_name: {
      sql: 'brawler_starpower_name',
      type: 'string',
    },
  },
})
