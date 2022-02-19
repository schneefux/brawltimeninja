cube(map, {
refreshKey: {
  every: '10 minutes',
},
sql: `SELECT * FROM brawltime.map_meta`,
rewriteQueries: true,

measures: {
  "mode_measure": {
    "title": "Mode",
    "sql": "any(battle_event_mode)",
    "type": "number"
  },
  "map_measure": {
    "title": "Map",
    "sql": "any(battle_event_map)",
    "type": "number"
  },
  "eventId_measure": {
    "title": "Event ID",
    "sql": "any(battle_event_id)",
    "type": "number"
  },
  "timestamp_measure": {
    "title": "Last Update",
    "sql": "formatDateTime(argMaxMerge(timestamp_state), '%FT%TZ', 'UTC')",
    "type": "number"
  },
  "trophyChange_measure": {
    "title": "Trophy Change",
    "sql": "avgMerge(battle_trophy_change_state)",
    "type": "number"
  },
  "winRate_measure": {
    "title": "Win Rate",
    "description": "The Win Rate tells you the % of battles a Brawler wins or ranks high.",
    "sql": "avgMerge(battle_victory_state)",
    "type": "number"
  },
  "winRateAdj_measure": {
    "title": "Adjusted Win Rate",
    "description": "The Adjusted Win Rate tells you the % of battles a Brawler wins or ranks high. For Brawlers with few picks, this value is interpolated.",
    "sql": "(1583+toFloat64(avgMerge(battle_victory_state))*SUM(picks))/(1583/least((avg(brawler_trophyrange)-5)*(avg(brawler_trophyrange)-5)/100+0.55, 0.9)+SUM(picks))",
    "type": "number"
  },
  "wins_measure": {
    "title": "Wins",
    "description": "The number of Wins recorded ranks Brawlers high who are played a lot and win a lot.",
    "sql": "toFloat64(avgMerge(battle_victory_state))*SUM(picks)",
    "type": "number"
  },
  "picks_measure": {
    "title": "Picks recorded",
    "sql": "sum(picks)",
    "type": "number"
  },
  "pickRate_measure": {
    "title": "Pick Rate",
    "description": "The Pick Rate tells you the % of battles this Brawler appears in.",
    "sql": "SUM(picks)",
    "type": "number"
  },
  "useRate_measure": {
    "title": "Use Rate",
    "description": "The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.",
    "sql": "picks_weighted",
    "type": "sum"
  },
  "starRate_measure": {
    "title": "Star Player",
    "description": "The Star Rate tells you the % of battles this Brawler becomes Star Player.",
    "sql": "avgMerge(battle_starplayer_state)",
    "type": "number"
  },
  "rank_measure": {
    "title": "Average Rank",
    "description": "The Average Rank tells you what place the Brawler is ranked in Showdown on average.",
    "sql": "avgMerge(battle_rank_state)",
    "type": "number"
  },
  "rank1Rate_measure": {
    "title": "#1 Rate",
    "description": "The #1 Rate tells you the % of Showdown battles a Brawler is #1.",
    "sql": "avgMerge(battle_rank1_state)",
    "type": "number"
  },
  "duration_measure": {
    "title": "Duration",
    "description": "The Duration tells you how long battles with this Brawler last on average in seconds.",
    "sql": "avgMerge(battle_duration_state)",
    "type": "number"
  },
  "level_measure": {
    "title": "Average Level",
    "sql": "avgMerge(battle_level_state)",
    "type": "number"
  },
  "brawler_measure": {
    "title": "Most played Brawler",
    "sql": "anyHeavy(brawler_name)",
    "type": "number"
  }
},

dimensions: {
  "brawler_dimension": {
    "title": "Brawler",
    "sql": "brawler_name",
    "type": "string",
    "shown": true
  },
  "season_dimension": {
    "title": "Bi-Week",
    "sql": "trophy_season_end",
    "type": "time",
    "shown": true
  },
  "trophyRange_dimension": {
    "title": "Trophy Range",
    "sql": "brawler_trophyrange",
    "type": "string",
    "shown": false
  },
  "mode_dimension": {
    "title": "Mode",
    "sql": "battle_event_mode",
    "type": "string",
    "shown": true
  },
  "map_dimension": {
    "title": "Map",
    "sql": "battle_event_map",
    "type": "string",
    "shown": true
  },
  "powerplay_dimension": {
    "title": "Power Play",
    "sql": "battle_event_powerplay",
    "type": "boolean",
    "shown": true
  }
}
})


cube(starpower, {
refreshKey: {
  every: '10 minutes',
},
sql: `SELECT * FROM brawltime.starpower_meta`,
rewriteQueries: true,

measures: {
  "mode_measure": {
    "title": "Mode",
    "sql": "any(battle_event_mode)",
    "type": "number"
  },
  "map_measure": {
    "title": "Map",
    "sql": "any(battle_event_map)",
    "type": "number"
  },
  "eventId_measure": {
    "title": "Event ID",
    "sql": "any(battle_event_id)",
    "type": "number"
  },
  "timestamp_measure": {
    "title": "Last Update",
    "sql": "formatDateTime(argMaxMerge(timestamp_state), '%FT%TZ', 'UTC')",
    "type": "number"
  },
  "trophyChange_measure": {
    "title": "Trophy Change",
    "sql": "avgMerge(battle_trophy_change_state)",
    "type": "number"
  },
  "winRate_measure": {
    "title": "Win Rate",
    "description": "The Win Rate tells you the % of battles a Brawler wins or ranks high.",
    "sql": "avgMerge(battle_victory_state)",
    "type": "number"
  },
  "winRateAdj_measure": {
    "title": "Adjusted Win Rate",
    "description": "The Adjusted Win Rate tells you the % of battles a Brawler wins or ranks high. For Brawlers with few picks, this value is interpolated.",
    "sql": "(1583+toFloat64(avgMerge(battle_victory_state))*SUM(picks))/(1583/least((avg(brawler_trophyrange)-5)*(avg(brawler_trophyrange)-5)/100+0.55, 0.9)+SUM(picks))",
    "type": "number"
  },
  "wins_measure": {
    "title": "Wins",
    "description": "The number of Wins recorded ranks Brawlers high who are played a lot and win a lot.",
    "sql": "toFloat64(avgMerge(battle_victory_state))*SUM(picks)",
    "type": "number"
  },
  "picks_measure": {
    "title": "Picks recorded",
    "sql": "sum(picks)",
    "type": "number"
  },
  "pickRate_measure": {
    "title": "Pick Rate",
    "description": "The Pick Rate tells you the % of battles this Brawler appears in.",
    "sql": "SUM(picks)",
    "type": "number"
  },
  "useRate_measure": {
    "title": "Use Rate",
    "description": "The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.",
    "sql": "picks_weighted",
    "type": "sum"
  },
  "starRate_measure": {
    "title": "Star Player",
    "description": "The Star Rate tells you the % of battles this Brawler becomes Star Player.",
    "sql": "avgMerge(battle_starplayer_state)",
    "type": "number"
  },
  "rank_measure": {
    "title": "Average Rank",
    "description": "The Average Rank tells you what place the Brawler is ranked in Showdown on average.",
    "sql": "avgMerge(battle_rank_state)",
    "type": "number"
  },
  "rank1Rate_measure": {
    "title": "#1 Rate",
    "description": "The #1 Rate tells you the % of Showdown battles a Brawler is #1.",
    "sql": "avgMerge(battle_rank1_state)",
    "type": "number"
  },
  "duration_measure": {
    "title": "Duration",
    "description": "The Duration tells you how long battles with this Brawler last on average in seconds.",
    "sql": "avgMerge(battle_duration_state)",
    "type": "number"
  },
  "level_measure": {
    "title": "Average Level",
    "sql": "avgMerge(battle_level_state)",
    "type": "number"
  },
  "brawler_measure": {
    "title": "Most played Brawler",
    "sql": "anyHeavy(brawler_name)",
    "type": "number"
  },
  "starpowerName_measure": {
    "title": "Star Power",
    "sql": "any(brawler_starpower_name)",
    "type": "number"
  }
},

dimensions: {
  "brawler_dimension": {
    "title": "Brawler",
    "sql": "brawler_name",
    "type": "string",
    "shown": true
  },
  "season_dimension": {
    "title": "Bi-Week",
    "sql": "trophy_season_end",
    "type": "time",
    "shown": true
  },
  "trophyRange_dimension": {
    "title": "Trophy Range",
    "sql": "brawler_trophyrange",
    "type": "string",
    "shown": false
  },
  "starpower_dimension": {
    "title": "Star Power",
    "sql": "brawler_starpower_id",
    "type": "string",
    "shown": true
  }
}
})


cube(gadget, {
refreshKey: {
  every: '10 minutes',
},
sql: `SELECT * FROM brawltime.gadget_meta`,
rewriteQueries: true,

measures: {
  "mode_measure": {
    "title": "Mode",
    "sql": "any(battle_event_mode)",
    "type": "number"
  },
  "map_measure": {
    "title": "Map",
    "sql": "any(battle_event_map)",
    "type": "number"
  },
  "eventId_measure": {
    "title": "Event ID",
    "sql": "any(battle_event_id)",
    "type": "number"
  },
  "timestamp_measure": {
    "title": "Last Update",
    "sql": "formatDateTime(argMaxMerge(timestamp_state), '%FT%TZ', 'UTC')",
    "type": "number"
  },
  "trophyChange_measure": {
    "title": "Trophy Change",
    "sql": "avgMerge(battle_trophy_change_state)",
    "type": "number"
  },
  "winRate_measure": {
    "title": "Win Rate",
    "description": "The Win Rate tells you the % of battles a Brawler wins or ranks high.",
    "sql": "avgMerge(battle_victory_state)",
    "type": "number"
  },
  "winRateAdj_measure": {
    "title": "Adjusted Win Rate",
    "description": "The Adjusted Win Rate tells you the % of battles a Brawler wins or ranks high. For Brawlers with few picks, this value is interpolated.",
    "sql": "(1583+toFloat64(avgMerge(battle_victory_state))*SUM(picks))/(1583/least((avg(brawler_trophyrange)-5)*(avg(brawler_trophyrange)-5)/100+0.55, 0.9)+SUM(picks))",
    "type": "number"
  },
  "wins_measure": {
    "title": "Wins",
    "description": "The number of Wins recorded ranks Brawlers high who are played a lot and win a lot.",
    "sql": "toFloat64(avgMerge(battle_victory_state))*SUM(picks)",
    "type": "number"
  },
  "picks_measure": {
    "title": "Picks recorded",
    "sql": "sum(picks)",
    "type": "number"
  },
  "pickRate_measure": {
    "title": "Pick Rate",
    "description": "The Pick Rate tells you the % of battles this Brawler appears in.",
    "sql": "SUM(picks)",
    "type": "number"
  },
  "useRate_measure": {
    "title": "Use Rate",
    "description": "The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.",
    "sql": "picks_weighted",
    "type": "sum"
  },
  "starRate_measure": {
    "title": "Star Player",
    "description": "The Star Rate tells you the % of battles this Brawler becomes Star Player.",
    "sql": "avgMerge(battle_starplayer_state)",
    "type": "number"
  },
  "rank_measure": {
    "title": "Average Rank",
    "description": "The Average Rank tells you what place the Brawler is ranked in Showdown on average.",
    "sql": "avgMerge(battle_rank_state)",
    "type": "number"
  },
  "rank1Rate_measure": {
    "title": "#1 Rate",
    "description": "The #1 Rate tells you the % of Showdown battles a Brawler is #1.",
    "sql": "avgMerge(battle_rank1_state)",
    "type": "number"
  },
  "duration_measure": {
    "title": "Duration",
    "description": "The Duration tells you how long battles with this Brawler last on average in seconds.",
    "sql": "avgMerge(battle_duration_state)",
    "type": "number"
  },
  "level_measure": {
    "title": "Average Level",
    "sql": "avgMerge(battle_level_state)",
    "type": "number"
  },
  "brawler_measure": {
    "title": "Most played Brawler",
    "sql": "anyHeavy(brawler_name)",
    "type": "number"
  },
  "gadgetName_measure": {
    "title": "Gadget",
    "sql": "any(brawler_gadget_name)",
    "type": "number"
  }
},

dimensions: {
  "brawler_dimension": {
    "title": "Brawler",
    "sql": "brawler_name",
    "type": "string",
    "shown": true
  },
  "season_dimension": {
    "title": "Bi-Week",
    "sql": "trophy_season_end",
    "type": "time",
    "shown": true
  },
  "trophyRange_dimension": {
    "title": "Trophy Range",
    "sql": "brawler_trophyrange",
    "type": "string",
    "shown": false
  },
  "brawlerId_dimension": {
    "title": "Brawler ID",
    "sql": "brawler_id",
    "type": "string",
    "shown": false
  },
  "gadget_dimension": {
    "title": "Gadget",
    "sql": "brawler_gadget_id",
    "type": "string",
    "shown": true
  }
}
})


cube(gear, {
refreshKey: {
  every: '10 minutes',
},
sql: `SELECT * FROM brawltime.gear_meta`,
rewriteQueries: true,

measures: {
  "mode_measure": {
    "title": "Mode",
    "sql": "any(battle_event_mode)",
    "type": "number"
  },
  "map_measure": {
    "title": "Map",
    "sql": "any(battle_event_map)",
    "type": "number"
  },
  "eventId_measure": {
    "title": "Event ID",
    "sql": "any(battle_event_id)",
    "type": "number"
  },
  "timestamp_measure": {
    "title": "Last Update",
    "sql": "formatDateTime(argMaxMerge(timestamp_state), '%FT%TZ', 'UTC')",
    "type": "number"
  },
  "trophyChange_measure": {
    "title": "Trophy Change",
    "sql": "avgMerge(battle_trophy_change_state)",
    "type": "number"
  },
  "winRate_measure": {
    "title": "Win Rate",
    "description": "The Win Rate tells you the % of battles a Brawler wins or ranks high.",
    "sql": "avgMerge(battle_victory_state)",
    "type": "number"
  },
  "winRateAdj_measure": {
    "title": "Adjusted Win Rate",
    "description": "The Adjusted Win Rate tells you the % of battles a Brawler wins or ranks high. For Brawlers with few picks, this value is interpolated.",
    "sql": "(1583+toFloat64(avgMerge(battle_victory_state))*SUM(picks))/(1583/least((avg(brawler_trophyrange)-5)*(avg(brawler_trophyrange)-5)/100+0.55, 0.9)+SUM(picks))",
    "type": "number"
  },
  "wins_measure": {
    "title": "Wins",
    "description": "The number of Wins recorded ranks Brawlers high who are played a lot and win a lot.",
    "sql": "toFloat64(avgMerge(battle_victory_state))*SUM(picks)",
    "type": "number"
  },
  "picks_measure": {
    "title": "Picks recorded",
    "sql": "sum(picks)",
    "type": "number"
  },
  "pickRate_measure": {
    "title": "Pick Rate",
    "description": "The Pick Rate tells you the % of battles this Brawler appears in.",
    "sql": "SUM(picks)",
    "type": "number"
  },
  "useRate_measure": {
    "title": "Use Rate",
    "description": "The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.",
    "sql": "picks_weighted",
    "type": "sum"
  },
  "starRate_measure": {
    "title": "Star Player",
    "description": "The Star Rate tells you the % of battles this Brawler becomes Star Player.",
    "sql": "avgMerge(battle_starplayer_state)",
    "type": "number"
  },
  "rank_measure": {
    "title": "Average Rank",
    "description": "The Average Rank tells you what place the Brawler is ranked in Showdown on average.",
    "sql": "avgMerge(battle_rank_state)",
    "type": "number"
  },
  "rank1Rate_measure": {
    "title": "#1 Rate",
    "description": "The #1 Rate tells you the % of Showdown battles a Brawler is #1.",
    "sql": "avgMerge(battle_rank1_state)",
    "type": "number"
  },
  "duration_measure": {
    "title": "Duration",
    "description": "The Duration tells you how long battles with this Brawler last on average in seconds.",
    "sql": "avgMerge(battle_duration_state)",
    "type": "number"
  },
  "level_measure": {
    "title": "Average Level",
    "sql": "avgMerge(battle_level_state)",
    "type": "number"
  },
  "brawler_measure": {
    "title": "Most played Brawler",
    "sql": "anyHeavy(brawler_name)",
    "type": "number"
  },
  "gearName_measure": {
    "title": "Gear",
    "sql": "any(brawler_gear_name)",
    "type": "number"
  }
},

dimensions: {
  "brawler_dimension": {
    "title": "Brawler",
    "sql": "brawler_name",
    "type": "string",
    "shown": true
  },
  "season_dimension": {
    "title": "Bi-Week",
    "sql": "trophy_season_end",
    "type": "time",
    "shown": true
  },
  "trophyRange_dimension": {
    "title": "Trophy Range",
    "sql": "brawler_trophyrange",
    "type": "string",
    "shown": false
  },
  "gear_dimension": {
    "title": "Gear",
    "sql": "brawler_gear_id",
    "type": "string",
    "shown": true
  }
}
})


cube(brawlerAllies, {
refreshKey: {
  every: '10 minutes',
},
sql: `SELECT * FROM brawltime.brawler_allies_mv`,
rewriteQueries: true,

measures: {
  "winRate_measure": {
    "title": "Win Rate",
    "description": "The Win Rate tells you the % of battles a Brawler wins or ranks high.",
    "sql": "sum(battle_victory) / sum(picks)",
    "type": "number"
  },
  "picks_measure": {
    "title": "Picks recorded",
    "sql": "sum(picks)",
    "type": "number"
  }
},

dimensions: {
  "brawler_dimension": {
    "title": "Brawler",
    "sql": "brawler_name",
    "type": "string",
    "shown": true
  },
  "season_dimension": {
    "title": "Bi-Week",
    "sql": "trophy_season_end",
    "type": "time",
    "shown": true
  },
  "trophyRange_dimension": {
    "title": "Trophy Range",
    "sql": "brawler_trophyrange",
    "type": "string",
    "shown": false
  },
  "brawlerId_dimension": {
    "title": "Brawler ID",
    "sql": "brawler_id",
    "type": "string",
    "shown": false
  },
  "ally_dimension": {
    "title": "Ally",
    "sql": "ally_brawler_name",
    "type": "string",
    "shown": true
  },
  "allyId_dimension": {
    "title": "Ally ID",
    "sql": "ally_brawler_id",
    "type": "string",
    "shown": false
  },
  "mode_dimension": {
    "title": "Mode",
    "sql": "battle_event_mode",
    "type": "string",
    "shown": true
  },
  "map_dimension": {
    "title": "Map",
    "sql": "battle_event_map",
    "type": "string",
    "shown": true
  }
}
})


cube(brawlerEnemies, {
refreshKey: {
  every: '10 minutes',
},
sql: `SELECT * FROM brawltime.brawler_enemies_mv`,
rewriteQueries: true,

measures: {
  "winRate_measure": {
    "title": "Win Rate",
    "description": "The Win Rate tells you the % of battles a Brawler wins or ranks high.",
    "sql": "sum(battle_victory) / sum(picks)",
    "type": "number"
  },
  "picks_measure": {
    "title": "Picks recorded",
    "sql": "sum(picks)",
    "type": "number"
  }
},

dimensions: {
  "brawler_dimension": {
    "title": "Brawler",
    "sql": "brawler_name",
    "type": "string",
    "shown": true
  },
  "season_dimension": {
    "title": "Bi-Week",
    "sql": "trophy_season_end",
    "type": "time",
    "shown": true
  },
  "trophyRange_dimension": {
    "title": "Trophy Range",
    "sql": "brawler_trophyrange",
    "type": "string",
    "shown": false
  },
  "brawlerId_dimension": {
    "title": "Brawler ID",
    "sql": "brawler_id",
    "type": "string",
    "shown": false
  },
  "enemy_dimension": {
    "title": "Enemery",
    "sql": "enemy_brawler_name",
    "type": "string",
    "shown": true
  },
  "enemyId_dimension": {
    "title": "Enemy ID",
    "sql": "enemy_brawler_id",
    "type": "string",
    "shown": false
  },
  "mode_dimension": {
    "title": "Mode",
    "sql": "battle_event_mode",
    "type": "string",
    "shown": true
  },
  "map_dimension": {
    "title": "Map",
    "sql": "battle_event_map",
    "type": "string",
    "shown": true
  }
}
})


cube(leaderboard, {
refreshKey: {
  every: '10 minutes',
},
sql: `SELECT * FROM brawltime.leaderboard`,
rewriteQueries: true,

measures: {
  "timestamp_measure": {
    "title": "Last Update",
    "sql": "formatDateTime(MAX(timestamp), '%FT%TZ', 'UTC')",
    "type": "number"
  },
  "playerName_measure": {
    "title": "Most common name",
    "sql": "any(player_name)",
    "type": "number"
  },
  "playerIcon_measure": {
    "title": "Most common icon",
    "sql": "any(player_icon_id)",
    "type": "number"
  },
  "expPoints_measure": {
    "title": "EXP",
    "sql": "player_exp_points",
    "type": "max"
  },
  "victories_measure": {
    "title": "3v3 Victories",
    "sql": "player_3vs3_victories",
    "type": "max"
  },
  "soloVictories_measure": {
    "title": "Solo Victories",
    "sql": "player_solo_victories",
    "type": "max"
  },
  "duoVictories_measure": {
    "title": "Duo Victories",
    "sql": "player_duo_victories",
    "type": "max"
  }
},

dimensions: {
  "player_dimension": {
    "title": "Player",
    "sql": "player_id",
    "type": "string",
    "shown": true
  }
}
})


cube(brawler, {
refreshKey: {
  every: '10 minutes',
},
sql: `SELECT * FROM brawltime.brawler`,
rewriteQueries: true,

measures: {
  "picks_measure": {
    "title": "Picks recorded",
    "sql": "",
    "type": "count"
  },
  "pickRate_measure": {
    "title": "Pick Rate",
    "description": "The Pick Rate tells you the % of battles this Brawler appears in.",
    "sql": "",
    "type": "count"
  },
  "useRate_measure": {
    "title": "Use Rate",
    "description": "The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.",
    "sql": "player_brawlers_length",
    "type": "sum"
  },
  "users_measure": {
    "title": "Players",
    "description": "The total number of players.",
    "sql": "uniqCombined(player_id)",
    "type": "number"
  },
  "timestamp_measure": {
    "title": "Last Update",
    "sql": "formatDateTime(MAX(timestamp), '%FT%TZ', 'UTC')",
    "type": "number"
  },
  "day_measure": {
    "title": "Day",
    "sql": "formatDateTime(MAX(toStartOfDay(timestamp)), '%FT%TZ', 'UTC')",
    "type": "number"
  },
  "playerName_measure": {
    "title": "Most common name",
    "sql": "any(player_name)",
    "type": "number"
  },
  "playerNameColor_measure": {
    "title": "Most common color",
    "sql": "any(player_name_color)",
    "type": "number"
  },
  "playerIcon_measure": {
    "title": "Most common icon",
    "sql": "any(player_icon_id)",
    "type": "number"
  },
  "playerTrophies_measure": {
    "title": "Player Trophies",
    "sql": "player_trophies",
    "type": "max"
  },
  "playerHighestTrophies_measure": {
    "title": "Player Highest Trophies",
    "sql": "player_highest_trophies",
    "type": "max"
  },
  "powerPlayPoints_measure": {
    "title": "Power Play Points",
    "sql": "player_power_play_points",
    "type": "max"
  },
  "highestPowerPlayPoints_measure": {
    "title": "Highest Power Play Points",
    "sql": "player_highest_power_play_points",
    "type": "max"
  },
  "expPoints_measure": {
    "title": "EXP",
    "sql": "player_exp_points",
    "type": "max"
  },
  "victories_measure": {
    "title": "3v3 Victories",
    "sql": "player_3vs3_victories",
    "type": "max"
  },
  "soloVictories_measure": {
    "title": "Solo Victories",
    "sql": "player_solo_victories",
    "type": "max"
  },
  "duoVictories_measure": {
    "title": "Duo Victories",
    "sql": "player_duo_victories",
    "type": "max"
  },
  "brawlers_measure": {
    "title": "Brawlers",
    "sql": "player_brawlers_length",
    "type": "max"
  },
  "clubName_measure": {
    "title": "Most common Club name",
    "sql": "any(player_club_name)",
    "type": "number"
  },
  "brawler_measure": {
    "title": "Most played Brawler",
    "sql": "anyHeavy(brawler_name)",
    "type": "number"
  },
  "power_measure": {
    "title": "Power",
    "sql": "brawler_power",
    "type": "avg"
  },
  "trophies_measure": {
    "title": "Trophies",
    "description": "The amount of Trophies tells you how many trophies players have with this Brawler on average.",
    "sql": "brawler_trophies",
    "type": "avg"
  },
  "highestTrophies_measure": {
    "title": "Highest Trophies",
    "sql": "brawler_highest_trophies",
    "type": "max"
  },
  "starpowers_measure": {
    "title": "Star Powers",
    "sql": "brawler_starpowers_length",
    "type": "max"
  },
  "gadgets_measure": {
    "title": "Gadgets",
    "sql": "brawler_gadgets_length",
    "type": "max"
  },
  "gears_measure": {
    "title": "Gears",
    "sql": "brawler_gears_length",
    "type": "max"
  }
},

dimensions: {
  "season_dimension": {
    "title": "Bi-Week",
    "sql": "trophy_season_end",
    "type": "time",
    "shown": true
  },
  "timestamp_dimension": {
    "title": "Timestamp",
    "sql": "timestamp",
    "type": "time",
    "shown": true
  },
  "day_dimension": {
    "title": "Day",
    "sql": "toStartOfDay(timestamp)",
    "type": "time",
    "shown": true
  },
  "player_dimension": {
    "title": "Player",
    "sql": "player_id",
    "type": "string",
    "shown": true
  },
  "brawler_dimension": {
    "title": "Brawler",
    "sql": "brawler_name",
    "type": "string",
    "shown": true
  },
  "brawlerId_dimension": {
    "title": "Brawler ID",
    "sql": "brawler_id",
    "type": "string",
    "shown": false
  },
  "trophyRange_dimension": {
    "title": "Trophy Range",
    "sql": "brawler_trophyrange",
    "type": "string",
    "shown": false
  }
}
})


cube(battle, {
refreshKey: {
  every: '10 minutes',
},
sql: `SELECT * FROM brawltime.battle`,
rewriteQueries: true,

measures: {
  "picks_measure": {
    "title": "Picks recorded",
    "sql": "",
    "type": "count"
  },
  "pickRate_measure": {
    "title": "Pick Rate",
    "description": "The Pick Rate tells you the % of battles this Brawler appears in.",
    "sql": "",
    "type": "count"
  },
  "useRate_measure": {
    "title": "Use Rate",
    "description": "The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.",
    "sql": "player_brawlers_length",
    "type": "sum"
  },
  "users_measure": {
    "title": "Players",
    "description": "The total number of players.",
    "sql": "uniqCombined(player_id)",
    "type": "number"
  },
  "timestamp_measure": {
    "title": "Last Update",
    "sql": "formatDateTime(MAX(timestamp), '%FT%TZ', 'UTC')",
    "type": "number"
  },
  "day_measure": {
    "title": "Day",
    "sql": "formatDateTime(MAX(toStartOfDay(timestamp)), '%FT%TZ', 'UTC')",
    "type": "number"
  },
  "playerName_measure": {
    "title": "Most common name",
    "sql": "any(player_name)",
    "type": "number"
  },
  "playerNameColor_measure": {
    "title": "Most common color",
    "sql": "any(player_name_color)",
    "type": "number"
  },
  "playerIcon_measure": {
    "title": "Most common icon",
    "sql": "any(player_icon_id)",
    "type": "number"
  },
  "playerTrophies_measure": {
    "title": "Player Trophies",
    "sql": "player_trophies",
    "type": "max"
  },
  "playerHighestTrophies_measure": {
    "title": "Player Highest Trophies",
    "sql": "player_highest_trophies",
    "type": "max"
  },
  "powerPlayPoints_measure": {
    "title": "Power Play Points",
    "sql": "player_power_play_points",
    "type": "max"
  },
  "highestPowerPlayPoints_measure": {
    "title": "Highest Power Play Points",
    "sql": "player_highest_power_play_points",
    "type": "max"
  },
  "expPoints_measure": {
    "title": "EXP",
    "sql": "player_exp_points",
    "type": "max"
  },
  "victories_measure": {
    "title": "3v3 Victories",
    "sql": "player_3vs3_victories",
    "type": "max"
  },
  "soloVictories_measure": {
    "title": "Solo Victories",
    "sql": "player_solo_victories",
    "type": "max"
  },
  "duoVictories_measure": {
    "title": "Duo Victories",
    "sql": "player_duo_victories",
    "type": "max"
  },
  "brawlers_measure": {
    "title": "Brawlers",
    "sql": "player_brawlers_length",
    "type": "max"
  },
  "clubName_measure": {
    "title": "Most common Club name",
    "sql": "any(player_club_name)",
    "type": "number"
  },
  "brawler_measure": {
    "title": "Most played Brawler",
    "sql": "anyHeavy(brawler_name)",
    "type": "number"
  },
  "power_measure": {
    "title": "Power",
    "sql": "brawler_power",
    "type": "avg"
  },
  "trophies_measure": {
    "title": "Trophies",
    "description": "The amount of Trophies tells you how many trophies players have with this Brawler on average.",
    "sql": "brawler_trophies",
    "type": "avg"
  },
  "highestTrophies_measure": {
    "title": "Highest Trophies",
    "sql": "brawler_highest_trophies",
    "type": "max"
  },
  "starpowers_measure": {
    "title": "Star Powers",
    "sql": "brawler_starpowers_length",
    "type": "max"
  },
  "gadgets_measure": {
    "title": "Gadgets",
    "sql": "brawler_gadgets_length",
    "type": "max"
  },
  "gears_measure": {
    "title": "Gears",
    "sql": "brawler_gears_length",
    "type": "max"
  },
  "wins_measure": {
    "title": "Wins",
    "sql": "battle_victory",
    "type": "sum"
  },
  "duration_measure": {
    "title": "Duration",
    "description": "The Duration tells you how long battles with this Brawler last on average in seconds.",
    "sql": "battle_duration",
    "type": "avg"
  },
  "rank_measure": {
    "title": "Average Rank",
    "description": "The Average Rank tells you what place the Brawler is ranked in Showdown on average.",
    "sql": "battle_rank",
    "type": "avg"
  },
  "rank1_measure": {
    "title": "#1 Recorded",
    "sql": "battle_rank1",
    "type": "sum"
  },
  "trophyChange_measure": {
    "title": "Trophy Change",
    "sql": "battle_trophy_change",
    "type": "avg"
  },
  "winRate_measure": {
    "title": "Win Rate",
    "description": "The Win Rate tells you the % of battles a Brawler wins or ranks high.",
    "sql": "battle_victory",
    "type": "avg"
  },
  "winRateAdj_measure": {
    "title": "Adjusted Win Rate",
    "description": "For Brawlers with few picks, the Adjusted Win Rate is interpolated using a Bayesian Average.",
    "sql": "(1583+toFloat64(AVG(battle_victory))*COUNT())/(1583/least((avg(brawler_trophyrange)-5)*(avg(brawler_trophyrange)-5)/100+0.55, 0.9)+COUNT())",
    "type": "number"
  },
  "starRate_measure": {
    "title": "Star Player",
    "description": "The Star Rate tells you the % of battles this Brawler becomes Star Player.",
    "sql": "battle_is_starplayer",
    "type": "avg"
  },
  "starpowerName_measure": {
    "title": "Star Power",
    "sql": "any(brawler_starpower_name)",
    "type": "number"
  },
  "gadgetName_measure": {
    "title": "Gadget",
    "sql": "any(brawler_gadget_name)",
    "type": "number"
  },
  "gearName_measure": {
    "title": "Gear",
    "sql": "any(brawler_gear_name)",
    "type": "number"
  }
},

dimensions: {
  "season_dimension": {
    "title": "Bi-Week",
    "sql": "trophy_season_end",
    "type": "time",
    "shown": true
  },
  "timestamp_dimension": {
    "title": "Timestamp",
    "sql": "timestamp",
    "type": "time",
    "shown": true
  },
  "day_dimension": {
    "title": "Day",
    "sql": "toStartOfDay(timestamp)",
    "type": "time",
    "shown": true
  },
  "player_dimension": {
    "title": "Player",
    "sql": "player_id",
    "type": "string",
    "shown": true
  },
  "brawler_dimension": {
    "title": "Brawler",
    "sql": "brawler_name",
    "type": "string",
    "shown": true
  },
  "brawlerId_dimension": {
    "title": "Brawler ID",
    "sql": "brawler_id",
    "type": "string",
    "shown": false
  },
  "trophyRange_dimension": {
    "title": "Trophy Range",
    "sql": "brawler_trophyrange",
    "type": "string",
    "shown": false
  },
  "mode_dimension": {
    "title": "Mode",
    "sql": "battle_event_mode",
    "type": "string",
    "shown": true
  },
  "map_dimension": {
    "title": "Map",
    "sql": "battle_event_map",
    "type": "string",
    "shown": true
  },
  "powerplay_dimension": {
    "title": "Power Play",
    "sql": "battle_event_powerplay",
    "type": "boolean",
    "shown": true
  },
  "team_dimension": {
    "title": "Team",
    "sql": "arraySort(arrayConcat(battle_allies.brawler_name, [brawler_name]))",
    "type": "string",
    "shown": true
  },
  "teamSize_dimension": {
    "title": "Team size",
    "sql": "length(battle_allies.brawler_name) + 1",
    "type": "number",
    "shown": false
  },
  "starpower_dimension": {
    "title": "Star Power",
    "sql": "brawler_starpower_id",
    "type": "string",
    "shown": true
  },
  "gadget_dimension": {
    "title": "Gadget",
    "sql": "brawler_gadget_id",
    "type": "string",
    "shown": true
  },
  "gear_dimension": {
    "title": "Gear",
    "sql": "brawler_gear_id",
    "type": "string",
    "shown": true
  }
}
})
