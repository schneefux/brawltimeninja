"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
exports.commonMeasurements = exports.brawlerMeasurements = exports.playerMeasurements = exports.getSeasonEnd = void 0;
// helper function which infers keys and restricts values to ElementType
var asDimensions = function (et) { return et; };
var asMeasurements = function (et) { return et; };
var asSlice = function (et) { return et; };
/* c&p from util */
function getSeasonEnd(timestamp) {
    var trophySeasonEnd = new Date(Date.parse('2020-07-13T08:00:00Z'));
    var diff = timestamp.getTime() - trophySeasonEnd.getTime();
    var seasonsSince = Math.ceil(diff / 1000 / 60 / 60 / 24 / 7 / 2);
    trophySeasonEnd.setUTCDate(trophySeasonEnd.getUTCDate() + seasonsSince * 7 * 2);
    return trophySeasonEnd;
}
exports.getSeasonEnd = getSeasonEnd;
var monthAgo = new Date();
monthAgo.setMonth(monthAgo.getMonth() - 1);
var metaDimensions = asDimensions({
    season: {
        id: 'season',
        name: 'Bi-Week',
        naturalIdAttribute: 'season',
        formatter: 'yyyy-MM-dd',
        additionalMeasures: [],
        hidden: false,
        type: 'temporal',
        scale: {
            nice: 'week'
        },
        config: {
            sql: 'trophy_season_end',
            type: 'time'
        }
    },
    day: {
        id: 'day',
        name: 'Day',
        naturalIdAttribute: 'day',
        formatter: 'yyyy-MM-dd',
        additionalMeasures: [],
        hidden: false,
        type: 'temporal',
        scale: {
            nice: 'day'
        },
        config: {
            sql: 'toStartOfDay(timestamp)',
            type: 'time'
        }
    },
    timestamp: {
        id: 'timestamp',
        name: 'Timestamp',
        naturalIdAttribute: 'timestamp',
        formatter: 'yyyy-MM-ddTHH:mm',
        additionalMeasures: [],
        hidden: false,
        type: 'temporal',
        scale: {
            nice: 'hour'
        },
        config: {
            sql: 'timestamp',
            type: 'time'
        }
    }
});
var playerDimensions = asDimensions({
    player: {
        id: 'player',
        name: 'Player',
        naturalIdAttribute: 'playerName',
        formatter: '',
        additionalMeasures: ['playerName', 'playerIcon'],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'player_id',
            type: 'string'
        }
    }
});
var brawlerDimensions = asDimensions({
    brawler: {
        id: 'brawler',
        name: 'Brawler',
        naturalIdAttribute: 'brawler',
        formatter: 'capitalizeWords',
        additionalMeasures: [],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'brawler_name',
            type: 'string'
        }
    },
    brawlerId: {
        id: 'brawlerId',
        name: 'Brawler ID',
        naturalIdAttribute: 'brawlerId',
        formatter: '',
        additionalMeasures: [],
        hidden: true,
        type: 'nominal',
        config: {
            sql: 'brawler_id',
            type: 'string'
        }
    },
    ally: {
        id: 'ally',
        name: 'Ally',
        naturalIdAttribute: 'ally',
        formatter: 'capitalizeWords',
        additionalMeasures: [],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'ally_brawler_name',
            type: 'string'
        }
    },
    allyId: {
        id: 'allyId',
        name: 'Ally ID',
        naturalIdAttribute: 'allyId',
        formatter: '',
        additionalMeasures: [],
        hidden: true,
        type: 'nominal',
        config: {
            sql: 'ally_brawler_id',
            type: 'string'
        }
    },
    gadget: {
        id: 'gadget',
        name: 'Gadget',
        naturalIdAttribute: 'gadgetName',
        formatter: 'capitalizeWords',
        additionalMeasures: ['gadgetName', 'brawler'],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'brawler_gadget_id',
            type: 'string'
        }
    },
    starpower: {
        id: 'starpower',
        name: 'Star Power',
        naturalIdAttribute: 'starpowerName',
        formatter: 'capitalizeWords',
        additionalMeasures: ['starpowerName', 'brawler'],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'brawler_starpower_id',
            type: 'string'
        }
    },
    bigbrawler: {
        id: 'bigbrawler',
        name: 'Big Brawler',
        naturalIdAttribute: 'bigbrawler',
        formatter: 'y/n',
        additionalMeasures: [],
        hidden: true,
        type: 'nominal',
        config: {
            sql: 'battle_is_bigbrawler',
            type: 'boolean'
        }
    },
    trophyRange: {
        id: 'trophyRange',
        name: 'Trophy Range',
        naturalIdAttribute: 'trophyRange',
        formatter: '',
        additionalMeasures: [],
        hidden: true,
        type: 'ordinal',
        config: {
            sql: 'brawler_trophyrange',
            type: 'string'
        }
    }
});
var battleDimensions = asDimensions({
    mode: {
        id: 'mode',
        name: 'Mode',
        naturalIdAttribute: 'mode',
        formatter: 'formatMode',
        additionalMeasures: [],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'battle_event_mode',
            type: 'string'
        }
    },
    map: {
        id: 'map',
        name: 'Map',
        naturalIdAttribute: 'map',
        formatter: '',
        additionalMeasures: ['mode', 'eventId'],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'battle_event_map',
            type: 'string'
        }
    },
    team: {
        id: 'team',
        name: 'Team',
        naturalIdAttribute: 'team',
        formatter: 'capitalizeWords',
        additionalMeasures: [],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'arraySort(arrayConcat(battle_allies.brawler_name, [brawler_name]))',
            type: 'string'
        }
    },
    teamSize: {
        id: 'teamSIze',
        name: 'Team size',
        naturalIdAttribute: 'team',
        formatter: '',
        additionalMeasures: [],
        hidden: false,
        type: 'quantitative',
        config: {
            sql: 'length(battle_allies.brawler_name) + 1',
            type: 'number'
        }
    },
    powerplay: {
        id: 'powerplay',
        name: 'Power Play',
        naturalIdAttribute: 'powerplay',
        formatter: 'y/n',
        additionalMeasures: [],
        hidden: false,
        type: 'nominal',
        config: {
            sql: 'battle_event_powerplay',
            type: 'boolean'
        }
    }
});
var commonDimensions = asDimensions(__assign(__assign(__assign(__assign({}, playerDimensions), brawlerDimensions), metaDimensions), battleDimensions));
var picks = 'SUM(picks)';
var winRate = "toFloat64(AVG(battle_victory))";
var zP = 'least((avg(brawler_trophyrange)-5)*(avg(brawler_trophyrange)-5)/100+0.55, 0.9)';
var winRateMerged = "toFloat64(avgMerge(battle_victory_state))";
var winratePosteriorMerged = "(1583+" + winRateMerged + "*" + picks + ")/(1583/" + zP + "+" + picks + ")";
var picksRaw = 'COUNT()';
var winratePosteriorRaw = "(1583+" + winRate + "*" + picksRaw + ")/(1583/" + zP + "+" + picksRaw + ")";
exports.playerMeasurements = asMeasurements({
    playerName: {
        id: 'playerName',
        name: 'Most common name',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'nominal',
        config: {
            sql: 'any(player_name)',
            type: 'number'
        }
    },
    clubName: {
        id: 'clubName',
        name: 'Most common Club name',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'nominal',
        config: {
            sql: 'any(player_club_name)',
            type: 'number'
        }
    },
    playerIcon: {
        id: 'playerIcon',
        name: 'Most common icon',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'nominal',
        config: {
            sql: 'any(player_icon_id)',
            type: 'number'
        }
    },
    playerNameColor: {
        id: 'playerNameColor',
        name: 'Most common color',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'nominal',
        config: {
            sql: 'any(player_name_color)',
            type: 'number'
        }
    },
    playerTrophies: {
        id: 'playerTrophies',
        name: 'Player Trophies',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_trophies',
            type: 'max'
        }
    },
    playerHighestTrophies: {
        id: 'playerHighestTrophies',
        name: 'Player Highest Trophies',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_highest_trophies',
            type: 'max'
        }
    },
    victories: {
        id: 'victories',
        name: '3v3 Victories',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_3vs3_victories',
            type: 'max'
        }
    },
    exp: {
        id: 'exp',
        name: 'Experience',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_exp',
            type: 'max'
        }
    },
    soloVictories: {
        id: 'soloVictories',
        name: 'Solo Victories',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_solo_victories',
            type: 'max'
        }
    },
    duoVictories: {
        id: 'duoVictories',
        name: 'Duo Victories',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_duo_victories',
            type: 'max'
        }
    },
    users: {
        id: 'users',
        name: 'Players',
        description: 'The total number of players.',
        formatter: '.1s',
        d3formatter: '.1s',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: 'uniqCombined(player_id)',
            type: 'number'
        }
    },
    powerPlayPoints: {
        id: 'powerPlayPoints',
        name: 'Power Play Points',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: 'player_power_play_points',
            type: 'max'
        }
    },
    highestPowerPlayPoints: {
        id: 'highestPowerPlayPoints',
        name: 'Highest Power Play Points',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: 'player_highest_power_play_points',
            type: 'max'
        }
    },
    expLevel: {
        id: 'expLevel',
        name: 'EXP Level',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: 'player_exp_level',
            type: 'max'
        }
    },
    expPoints: {
        id: 'expPoints',
        name: 'EXP',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: 'player_exp_points',
            type: 'max'
        }
    },
    brawlers: {
        id: 'brawlers',
        name: 'Brawlers',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: 'player_brawlers_length',
            type: 'max'
        }
    }
});
exports.brawlerMeasurements = asMeasurements({
    highestTrophies: {
        id: 'highestTrophies',
        name: 'Highest Trophies',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: 'brawler_highest_trophies',
            type: 'max'
        }
    },
    trophies: {
        id: 'trophies',
        name: 'Trophies',
        description: 'The amount of Trophies tells you how many trophies players have with this Brawler on average.',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'brawler_trophies',
            type: 'avg'
        }
    },
    brawler: {
        id: 'brawler',
        name: 'Most played Brawler',
        description: '',
        formatter: 'capitalizeWords',
        d3formatter: '',
        sign: -1,
        type: 'nominal',
        config: {
            sql: 'anyHeavy(brawler_name)',
            type: 'number'
        }
    },
    starpowers: {
        id: 'starpowers',
        name: 'Star Powers',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: 'brawler_starpowers_length',
            type: 'max'
        }
    },
    gadgets: {
        id: 'gadgets',
        name: 'Gadgets',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: 'brawler_gadgets_length',
            type: 'max'
        }
    }
});
var metaMeasurements = asMeasurements({
    timestamp: {
        // TODO
        id: 'timestamp',
        name: 'Last Update',
        description: '',
        formatter: 'yyyy-MM-ddTHH:mm',
        d3formatter: '',
        sign: -1,
        type: 'temporal',
        config: {
            sql: 'formatDateTime(MAX(timestamp), \'%FT%TZ\', \'UTC\')',
            type: 'number'
        }
    },
    day: {
        // TODO
        id: 'day',
        name: 'Day',
        description: '',
        formatter: 'yyyy-MM-dd',
        d3formatter: '',
        sign: -1,
        type: 'temporal',
        config: {
            sql: 'formatDateTime(MAX(toStartOfDay(timestamp)), \'%FT%TZ\', \'UTC\')',
            type: 'number'
        }
    }
});
var battleMeasurements = asMeasurements({
    trophyChange: {
        id: 'trophyChange',
        name: 'Trophy Change',
        description: '',
        formatter: '+.2f',
        d3formatter: '+.2f',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'battle_trophy_change',
            type: 'avg'
        }
    },
    winRate: {
        id: 'winRate',
        name: 'Win Rate',
        description: 'The Win Rate tells you the % of battles a Brawler wins or ranks high.',
        formatter: '.1%',
        d3formatter: '.1%',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'battle_victory',
            type: 'avg'
        }
    },
    winRateAdj: {
        id: 'winRateAdj',
        name: 'Adjusted Win Rate',
        description: 'The Adjusted Win Rate tells you the % of battles a Brawler wins or ranks high. For Brawlers with few picks, this value is interpolated.',
        formatter: '.1%',
        d3formatter: '.1%',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: winratePosteriorRaw,
            type: 'number'
        }
    },
    winRateDiff: {
        id: 'winRateDiff',
        name: 'Win Rate Diff',
        description: 'The Win Rate Difference compares the Win Rate of Brawlers with a Star Power / Gadget to those without.',
        formatter: '+.2%',
        d3formatter: '+.2%',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: '',
            type: 'number'
        }
    },
    wins: {
        id: 'wins',
        name: 'Wins',
        description: 'The number of Wins recorded ranks Brawlers high who are played a lot and win a lot.',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: 'battle_victory',
            type: 'sum'
        }
    },
    winsZScore: {
        id: 'winsZScore',
        name: 'Wins z-Score',
        description: 'The Wins z-score uses a statistical test to compare the wins of Brawlers with a Star Power / Gadget to those without. Scores higher/lower than 2 are good/bad.',
        formatter: '.2f',
        d3formatter: '.2f',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: '',
            type: 'number'
        }
    },
    picks: {
        id: 'picks',
        name: 'Picks recorded',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: '',
            type: 'count'
        }
    },
    pickRate: {
        id: 'pickRate',
        name: 'Pick Rate',
        description: 'The Pick Rate tells you the % of battles this Brawler appears in.',
        formatter: '.2%',
        d3formatter: '.2%',
        sign: -1,
        percentageOver: 'brawler',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: '',
            type: 'count'
        }
    },
    useRate: {
        id: 'useRate',
        name: 'Use Rate',
        description: 'The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.',
        formatter: '.2%',
        d3formatter: '.2%',
        sign: -1,
        percentageOver: 'brawler',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'player_brawlers_length',
            type: 'sum'
        }
    },
    starRate: {
        id: 'starRate',
        name: 'Star Player',
        description: 'The Star Rate tells you the % of battles this Brawler becomes Star Player.',
        formatter: '.1%',
        d3formatter: '.1%',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'battle_is_starplayer',
            type: 'avg'
        }
    },
    starRateDiff: {
        id: 'starRateDiff',
        name: 'Star Player Diff.',
        description: 'The Star Rate Difference compares the Star Rate of Brawlers with a Star Power / Gadget to those without.',
        formatter: '+.2%',
        d3formatter: '+.2%',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: '',
            type: 'number'
        }
    },
    rank: {
        id: 'rank',
        name: 'Average Rank',
        description: 'The Average Rank tells you what place the Brawler is ranked in Showdown on average.',
        formatter: '.2f',
        d3formatter: '.2f',
        sign: +1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'battle_rank',
            type: 'avg'
        }
    },
    rank1: {
        id: 'rank1',
        name: '#1 Recorded',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: 'battle_rank1',
            type: 'sum'
        }
    },
    rank1Rate: {
        id: 'rank1Rate',
        name: '#1 Rate',
        description: 'The #1 Rate tells you the % of Showdown battles a Brawler is #1.',
        formatter: '.2%',
        d3formatter: '.2%',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'battle_rank1',
            type: 'avg'
        }
    },
    rank1RateDiff: {
        id: 'rank1RateDiff',
        name: '#1 Rate Diff.',
        description: 'The #1 Rate Difference compares the #1 Rate of Brawlers with a Star Power / Gadget to those without.',
        formatter: '+.2%',
        d3formatter: '+.2%',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: '',
            type: 'number'
        }
    },
    duration: {
        id: 'duration',
        name: 'Duration',
        description: 'The Duration tells you how long battles with this Brawler last on average in seconds.',
        formatter: 'duration',
        d3formatter: 'duration',
        sign: +1,
        type: 'quantitative',
        config: {
            sql: 'battle_duration',
            type: 'avg'
        }
    },
    level: {
        id: 'level',
        name: 'Average Level',
        description: '',
        formatter: '.2f',
        d3formatter: '.2f',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'battle_level',
            type: 'avg'
        }
    },
    power: {
        id: 'power',
        name: 'Power',
        description: '',
        formatter: '.2f',
        d3formatter: '.2f',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'brawler_power',
            type: 'avg'
        }
    },
    starpowerName: {
        id: 'starpowerName',
        name: 'Star Power',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'nominal',
        config: {
            sql: 'any(brawler_starpower_name)',
            type: 'number'
        }
    },
    gadgetName: {
        id: 'gadgetName',
        name: 'Gadget',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'nominal',
        config: {
            sql: 'any(brawler_gadget_name)',
            type: 'number'
        }
    },
    eventId: {
        id: 'eventId',
        name: 'Event ID',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'nominal',
        config: {
            sql: 'any(battle_event_id)',
            type: 'number'
        }
    },
    map: {
        id: 'map',
        name: 'Map',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'nominal',
        config: {
            sql: 'any(battle_event_map)',
            type: 'number'
        }
    },
    mode: {
        id: 'mode',
        name: 'Mode',
        description: '',
        formatter: '',
        d3formatter: '',
        sign: -1,
        type: 'nominal',
        config: {
            sql: 'any(battle_event_mode)',
            type: 'number'
        }
    }
});
// same as battleMeasurements, but using clickhouse merge for mv
var mergedbattleMeasurements = asMeasurements({
    timestamp: {
        id: 'timestamp',
        name: 'Last Update',
        description: '',
        formatter: 'yyyy-MM-ddTHH:mm',
        d3formatter: '',
        sign: -1,
        type: 'temporal',
        config: {
            sql: 'formatDateTime(argMaxMerge(timestamp_state), \'%FT%TZ\', \'UTC\')',
            type: 'number'
        }
    },
    picks: {
        id: 'picks',
        name: 'Picks recorded',
        description: '',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: 'sum(picks)',
            type: 'number'
        }
    },
    trophyChange: {
        id: 'trophyChange',
        name: 'Trophy Change',
        description: '',
        formatter: '+.2f',
        d3formatter: '+.2f',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'avgMerge(battle_trophy_change_state)',
            type: 'number'
        }
    },
    winRate: {
        id: 'winRate',
        name: 'Win Rate',
        description: 'The Win Rate tells you the % of battles a Brawler wins or ranks high.',
        formatter: '.1%',
        d3formatter: '.1%',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'avgMerge(battle_victory_state)',
            type: 'number'
        }
    },
    winRateAdj: {
        id: 'winRateAdj',
        name: 'Adjusted Win Rate',
        description: 'The Adjusted Win Rate tells you the % of battles a Brawler wins or ranks high. For Brawlers with few picks, this value is interpolated.',
        formatter: '.1%',
        d3formatter: '.1%',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: winratePosteriorMerged,
            type: 'number'
        }
    },
    wins: {
        id: 'wins',
        name: 'Wins',
        description: 'The number of Wins recorded ranks Brawlers high who are played a lot and win a lot.',
        formatter: '.2s',
        d3formatter: '.2s',
        sign: -1,
        type: 'quantitative',
        config: {
            sql: winRateMerged + "*" + picks,
            type: 'number'
        }
    },
    pickRate: {
        id: 'pickRate',
        name: 'Pick Rate',
        description: 'The Pick Rate tells you the % of battles this Brawler appears in.',
        formatter: '.2%',
        d3formatter: '.2%',
        sign: -1,
        percentageOver: 'brawler',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'SUM(picks)',
            type: 'number'
        }
    },
    useRate: {
        id: 'useRate',
        name: 'Use Rate',
        description: 'The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.',
        formatter: '.2%',
        d3formatter: '.2%',
        sign: -1,
        percentageOver: 'brawler',
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'picks_weighted',
            type: 'sum'
        }
    },
    starRate: {
        id: 'starRate',
        name: 'Star Player',
        description: 'The Star Rate tells you the % of battles this Brawler becomes Star Player.',
        formatter: '.1%',
        d3formatter: '.1%',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'avgMerge(battle_starplayer_state)',
            type: 'number'
        }
    },
    rank: {
        id: 'rank',
        name: 'Average Rank',
        description: 'The Average Rank tells you what place the Brawler is ranked in Showdown on average.',
        formatter: '.2f',
        d3formatter: '.2f',
        sign: +1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'avgMerge(battle_rank_state)',
            type: 'number'
        }
    },
    rank1Rate: {
        id: 'rank1Rate',
        name: '#1 Rate',
        description: 'The #1 Rate tells you the % of Showdown battles a Brawler is #1.',
        formatter: '.2%',
        d3formatter: '.2%',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'avgMerge(battle_rank1_state)',
            type: 'number'
        }
    },
    duration: {
        id: 'duration',
        name: 'Duration',
        description: 'The Duration tells you how long battles with this Brawler last on average in seconds.',
        formatter: 'duration',
        d3formatter: 'duration',
        sign: +1,
        type: 'quantitative',
        config: {
            sql: 'avgMerge(battle_duration_state)',
            type: 'number'
        }
    },
    level: {
        id: 'level',
        name: 'Average Level',
        description: '',
        formatter: '.2f',
        d3formatter: '.2f',
        sign: -1,
        type: 'quantitative',
        scale: {
            zero: false
        },
        config: {
            sql: 'avgMerge(battle_level_state)',
            type: 'number'
        }
    }
});
exports.commonMeasurements = asMeasurements(__assign(__assign(__assign(__assign({}, metaMeasurements), exports.playerMeasurements), exports.brawlerMeasurements), battleMeasurements));
var metaSlices = asSlice({
    season: {
        id: 'season',
        name: 'Since Time',
        config: {
            member: 'season_dimension',
            operator: 'afterDate'
        }
    },
    seasonExact: {
        id: 'seasonExact',
        name: 'Time',
        config: {
            member: 'season_dimension',
            operator: 'equals'
        }
    },
    timestamp: {
        id: 'timestamp',
        name: 'Since Time',
        config: {
            member: 'timestamp_dimension',
            operator: 'afterDate'
        }
    }
});
var playerSlices = asSlice({
    playerName: {
        id: 'playerName',
        name: 'Player Name',
        config: {
            member: 'player_name_dimension',
            operator: 'contains'
        }
    },
    playerId: {
        id: 'playerId',
        name: 'Player ID',
        config: {
            member: 'player_dimension',
            operator: 'equals'
        }
    }
});
var brawlerSlices = asSlice({
    brawler: {
        id: 'brawler',
        name: 'Brawler',
        config: {
            member: 'brawler_dimension',
            operator: 'equals'
        }
    },
    brawlerId: {
        id: 'brawlerId',
        name: 'Brawler ID',
        config: {
            member: 'brawler_id_dimension',
            operator: 'equals'
        }
    },
    ally: {
        id: 'ally',
        name: 'Ally',
        config: {
            member: 'ally_brawler_dimension',
            operator: 'equals'
        }
    },
    allyId: {
        id: 'allyId',
        name: 'Ally ID',
        config: {
            member: 'ally_brawler_id_dimension',
            operator: 'equals'
        }
    },
    trophyRangeGte: {
        id: 'trophyRangeGte',
        name: 'Trophy Range greater than equals',
        config: {
            member: 'trophyRange_dimension',
            operator: 'gte'
        }
    },
    trophyRangeLt: {
        id: 'trophyRangeLt',
        name: 'Trophy Range lower than',
        config: {
            member: 'trophyRange_dimension',
            operator: 'lt'
        }
    },
    starpowerIdEq: {
        id: 'starpowerIdEq',
        name: 'Star Power ID equals',
        config: {
            member: 'starpower_dimension',
            operator: 'equals'
        }
    },
    starpowerIdNeq: {
        id: 'starpowerIdNeq',
        name: 'Star Power ID not equals',
        config: {
            member: 'starpower_dimension',
            operator: 'notEquals'
        }
    },
    gadgetIdEq: {
        id: 'gadgetIdEq',
        name: 'Gadget ID equals',
        config: {
            member: 'gadget_dimension',
            operator: 'equals'
        }
    },
    gadgetIdNeq: {
        id: 'gadgetIdNeq',
        name: 'Gadget ID not equals',
        config: {
            member: 'gadget_dimension',
            operator: 'notEquals'
        }
    },
    teamSizeEq: {
        id: 'teamSizeEq',
        name: 'Team size',
        config: {
            member: 'teamSize',
            operator: 'equals'
        }
    }
});
var battleSlices = asSlice({
    mode: {
        id: 'mode',
        name: 'Mode',
        config: {
            member: 'mode_dimension',
            operator: 'equals'
        }
    },
    map: {
        id: 'map',
        name: 'Map',
        config: {
            member: 'map_dimension',
            operator: 'equals'
        }
    },
    id: {
        id: 'id',
        name: 'Event ID',
        config: {
            member: 'eventId_measure',
            operator: 'equals'
        }
    },
    mapLike: {
        id: 'mapLike',
        name: 'Map Name',
        config: {
            member: 'map_dimension',
            operator: 'contains'
        }
    },
    mapNotLike: {
        id: 'mapNotLike',
        name: 'not Map Name',
        config: {
            member: 'map_dimension',
            operator: 'notContains'
        }
    },
    powerplay: {
        id: 'powerplay',
        name: 'Power Play',
        config: {
            member: 'powerplay_dimension',
            operator: 'equals'
        }
    },
    bigbrawler: {
        id: 'bigbrawler',
        name: 'Big Brawler',
        config: {
            member: 'bigbrawler_dimension',
            operator: 'equals'
        }
    }
});
var commonSlices = asSlice(__assign(__assign(__assign(__assign({}, metaSlices), playerSlices), battleSlices), brawlerSlices));
var brawlerBattleMeasurements = [
    /*
    mergedbattleMeasurements.trophySeasonEnd,
    */
    exports.commonMeasurements.mode,
    exports.commonMeasurements.map,
    exports.commonMeasurements.eventId,
    mergedbattleMeasurements.timestamp,
    mergedbattleMeasurements.trophyChange,
    mergedbattleMeasurements.winRate,
    mergedbattleMeasurements.winRateAdj,
    mergedbattleMeasurements.wins,
    mergedbattleMeasurements.picks,
    mergedbattleMeasurements.pickRate,
    mergedbattleMeasurements.useRate,
    mergedbattleMeasurements.starRate,
    mergedbattleMeasurements.rank,
    mergedbattleMeasurements.rank1Rate,
    mergedbattleMeasurements.duration,
    mergedbattleMeasurements.level,
    exports.commonMeasurements.brawler,
];
var brawlerBattleDimensions = [
    commonDimensions.brawler,
    commonDimensions.season,
    commonDimensions.trophyRange,
];
var brawlerBattleSlices = [
    commonSlices.season,
    commonSlices.seasonExact,
    commonSlices.trophyRangeGte,
    commonSlices.trophyRangeLt,
    commonSlices.brawler,
];
var brawlerBattleDefaultSliceValues = {
    season: [getSeasonEnd(monthAgo).toISOString().slice(0, 10)],
    trophyRangeGte: ['0'],
    trophyRangeLt: ['10'],
    brawler: []
};
var playerBrawlerDimensions = [
    commonDimensions.season,
    commonDimensions.timestamp,
    commonDimensions.day,
    commonDimensions.player,
    commonDimensions.brawler,
    commonDimensions.brawlerId,
    commonDimensions.trophyRange,
];
var playerBrawlerMeasurements = [
    exports.commonMeasurements.picks,
    exports.commonMeasurements.pickRate,
    exports.commonMeasurements.useRate,
    exports.commonMeasurements.users,
    // commonMeasurements.season,
    exports.commonMeasurements.timestamp,
    exports.commonMeasurements.day,
    exports.commonMeasurements.playerName,
    exports.commonMeasurements.playerNameColor,
    exports.commonMeasurements.playerIcon,
    exports.commonMeasurements.playerTrophies,
    exports.commonMeasurements.playerHighestTrophies,
    exports.commonMeasurements.powerPlayPoints,
    exports.commonMeasurements.highestPowerPlayPoints,
    exports.commonMeasurements.expPoints,
    // commonMeasurements.championshipQualified,
    exports.commonMeasurements.victories,
    exports.commonMeasurements.soloVictories,
    exports.commonMeasurements.duoVictories,
    // commonMeasurements.roboRumble,
    // commonMeasurements.bigBrawler,
    exports.commonMeasurements.brawlers,
    // commonMeasurements.clubId,
    // commonMeasurements.clubTag,
    exports.commonMeasurements.clubName,
    // commonMeasurements.brawlerId,
    exports.commonMeasurements.brawler,
    exports.commonMeasurements.power,
    exports.commonMeasurements.trophies,
    exports.commonMeasurements.highestTrophies,
    exports.commonMeasurements.starpowers,
    exports.commonMeasurements.gadgets,
];
var playerBrawlerSlices = [
    commonSlices.playerId,
    commonSlices.playerName,
    commonSlices.season,
    commonSlices.trophyRangeGte,
    commonSlices.trophyRangeLt,
    commonSlices.brawlerId,
    commonSlices.brawler,
];
var playerBrawlerDefaultSliceValues = {
    playerId: [],
    playerName: [],
    season: [getSeasonEnd(monthAgo).toISOString().slice(0, 10)],
    trophies: [],
    brawlerId: [],
    brawlerName: []
};
var cubes = {
    map: {
        id: 'map',
        table: 'map_meta',
        name: 'Map',
        hidden: false,
        dimensions: __spreadArray(__spreadArray([], brawlerBattleDimensions), [
            commonDimensions.mode,
            commonDimensions.map,
            commonDimensions.powerplay,
        ]),
        defaultDimensionsIds: ['brawler'],
        measurements: __spreadArray([], brawlerBattleMeasurements),
        defaultMeasurementIds: ['winRateAdj'],
        metaMeasurements: ['picks', 'timestamp'],
        slices: __spreadArray(__spreadArray([], brawlerBattleSlices), [
            commonSlices.mode,
            commonSlices.map,
            commonSlices.id,
            commonSlices.mapLike,
            commonSlices.mapNotLike,
            commonSlices.powerplay,
        ]),
        defaultSliceValues: __assign(__assign({}, brawlerBattleDefaultSliceValues), { mode: [], map: [], mapLike: [], mapNotLike: [], powerplay: ['false'] })
    },
    starpower: {
        id: 'starpower',
        table: 'starpower_meta',
        name: 'Star Power',
        hidden: false,
        dimensions: __spreadArray(__spreadArray([], brawlerBattleDimensions), [
            commonDimensions.brawlerId,
            commonDimensions.starpower,
        ]),
        defaultDimensionsIds: ['brawler', 'starpower'],
        measurements: __spreadArray(__spreadArray([], brawlerBattleMeasurements), [
            exports.commonMeasurements.starpowerName,
        ]),
        defaultMeasurementIds: ['winRateAdj'],
        metaMeasurements: ['picks', 'timestamp'],
        slices: __spreadArray(__spreadArray([], brawlerBattleSlices), [
            commonSlices.starpowerIdEq,
            commonSlices.starpowerIdNeq,
        ]),
        defaultSliceValues: __assign(__assign({}, brawlerBattleDefaultSliceValues), { starpowerIdNeq: ['0'] })
    },
    gadget: {
        id: 'gadget',
        table: 'gadget_meta',
        name: 'Gadget',
        hidden: false,
        dimensions: __spreadArray(__spreadArray([], brawlerBattleDimensions), [
            commonDimensions.brawlerId,
            commonDimensions.gadget,
        ]),
        defaultDimensionsIds: ['brawler', 'gadget'],
        measurements: __spreadArray(__spreadArray([], brawlerBattleMeasurements), [
            exports.commonMeasurements.gadgetName,
        ]),
        defaultMeasurementIds: ['winRateAdj'],
        metaMeasurements: ['picks', 'timestamp'],
        slices: __spreadArray(__spreadArray([], brawlerBattleSlices), [
            commonSlices.gadgetIdEq,
            commonSlices.gadgetIdNeq,
        ]),
        defaultSliceValues: __assign(__assign({}, brawlerBattleDefaultSliceValues), { gadgetIdNeq: ['0'] })
    },
    synergy: {
        id: 'synergy',
        table: 'synergy_meta',
        name: 'Synergies',
        hidden: false,
        dimensions: __spreadArray(__spreadArray([], brawlerBattleDimensions), [
            commonDimensions.brawlerId,
            commonDimensions.ally,
            commonDimensions.allyId,
            commonDimensions.mode,
            commonDimensions.map,
        ]),
        defaultDimensionsIds: ['brawler'],
        measurements: __spreadArray([], brawlerBattleMeasurements),
        defaultMeasurementIds: ['winRateAdj'],
        metaMeasurements: ['picks', 'timestamp'],
        slices: __spreadArray(__spreadArray([], brawlerBattleSlices), [
            commonSlices.mode,
            commonSlices.map,
            commonSlices.brawlerId,
            commonSlices.ally,
            commonSlices.allyId,
        ]),
        defaultSliceValues: __assign(__assign({}, brawlerBattleDefaultSliceValues), { mode: [], map: [], ally: [] })
    },
    player: {
        id: 'leaderboard',
        table: 'leaderboard',
        name: 'Leaderboard',
        hidden: true,
        dimensions: [
            commonDimensions.player,
        ],
        defaultDimensionsIds: ['player'],
        measurements: [
            exports.commonMeasurements.timestamp,
            exports.commonMeasurements.playerName,
            exports.commonMeasurements.playerIcon,
            exports.commonMeasurements.expPoints,
            exports.commonMeasurements.victories,
            exports.commonMeasurements.soloVictories,
            exports.commonMeasurements.duoVictories,
        ],
        defaultMeasurementIds: ['victories'],
        metaMeasurements: ['timestamp'],
        slices: [
            commonSlices.timestamp,
        ],
        defaultSliceValues: {
            timestamp: []
        }
    },
    player_brawler: {
        id: 'player_brawler',
        table: 'player_brawler',
        name: 'Brawler Leaderboard',
        hidden: false,
        dimensions: [
            commonDimensions.player,
            commonDimensions.brawlerId,
        ],
        defaultDimensionsIds: ['player'],
        measurements: [
            exports.commonMeasurements.playerName,
            exports.commonMeasurements.playerIcon,
            exports.commonMeasurements.brawler,
            exports.commonMeasurements.highestTrophies,
        ],
        defaultMeasurementIds: ['highestTrophies'],
        metaMeasurements: ['timestamp'],
        slices: [
            commonSlices.timestamp,
        ],
        defaultSliceValues: {
            timestamp: []
        }
    },
    brawler: {
        id: 'brawler',
        table: 'brawler',
        name: 'Raw Brawlers',
        hidden: true,
        dimensions: __spreadArray([], playerBrawlerDimensions),
        defaultDimensionsIds: ['player'],
        measurements: __spreadArray([], playerBrawlerMeasurements),
        defaultMeasurementIds: ['picks'],
        metaMeasurements: ['timestamp'],
        slices: __spreadArray([], playerBrawlerSlices),
        defaultSliceValues: __assign({}, playerBrawlerDefaultSliceValues)
    },
    battle: {
        id: 'battle',
        table: 'battle',
        name: 'Raw Battles',
        hidden: true,
        dimensions: __spreadArray(__spreadArray([], playerBrawlerDimensions), [
            commonDimensions.mode,
            commonDimensions.map,
            commonDimensions.powerplay,
            commonDimensions.team,
        ]),
        defaultDimensionsIds: ['player'],
        measurements: __spreadArray(__spreadArray([], playerBrawlerMeasurements), [
            battleMeasurements.wins,
            battleMeasurements.duration,
            battleMeasurements.rank,
            battleMeasurements.rank1,
            battleMeasurements.trophyChange,
            battleMeasurements.winRate,
            battleMeasurements.winRateAdj,
            battleMeasurements.starRate,
            battleMeasurements.rank,
        ]),
        defaultMeasurementIds: ['picks'],
        metaMeasurements: ['timestamp', 'picks'],
        slices: __spreadArray(__spreadArray([], playerBrawlerSlices), [
            commonSlices.mode,
            commonSlices.map,
            commonSlices.powerplay,
        ]),
        defaultSliceValues: __assign(__assign({}, playerBrawlerDefaultSliceValues), { mode: [], map: [], powerplay: [] })
    }
};
exports["default"] = cubes;
