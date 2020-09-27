// rebuild for frontend with ./node_modules/.bin/tsc lib/util.ts -m ESNext
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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
export var camelToSnakeCase = function (str) { return str.replace(/[A-Z]/g, function (letter) { return "_" + letter.toLowerCase(); }); };
export var camelToKebab = function (s) {
    return s.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};
export var capitalize = function (str) { return str.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); }); };
export var capitalizeWords = function (str) { return str.split(' ').map(function (w) { return capitalize(w); }).join(' '); };
export function scaleMinMax(values) {
    var min = Math.min.apply(Math, values);
    var max = Math.max.apply(Math, values);
    if (min === max) {
        return values.map(function (value) { return 0.5; });
    }
    return values.map(function (value) { return (value - min) / (max - min); });
}
export function zip(arr1, arr2) {
    return arr1.map(function (value, index) { return [value, arr2[index]]; });
}
export function hoursSinceDate(date) {
    var then = Date.parse(date);
    var now = (new Date()).getTime();
    return Math.floor((now - then) / 1000 / 3600);
}
export function relativeTimeUntil(timestamp) {
    var then = new Date(timestamp);
    var now = new Date();
    var time = (then.getTime() - now.getTime()) / 1000;
    var str = '';
    if (time > 60 * 60 * 24) {
        var days = Math.floor(time / (60 * 60 * 24));
        str += days + 'd ';
        time -= days * 60 * 60 * 24;
    }
    var hours = Math.floor(time / (60 * 60));
    str += hours + 'h ';
    time -= hours * 60 * 60;
    var minutes = Math.floor(time / 60);
    str += minutes + 'm ';
    time -= minutes * 60;
    return str;
}
export var brawlerId = function (entry) {
    return entry.name.replace(/\.| /g, '_').toLowerCase();
};
export var modeToBackgroundId = function (modeCamelCase) {
    var mode = camelToSnakeCase(modeCamelCase);
    if (mode == 'big_game') {
        return 'bossfight';
    }
    if (mode.endsWith('showdown')) {
        return 'showdown';
    }
    return mode.replace('_', '');
};
export function formatMode(mode) {
    return camelToSnakeCase(mode)
        .split('_')
        .map(function (w) { return capitalize(w); })
        .join(' ');
}
export function unformatMode(mode) {
    var uncapitalize = function (str) { return str.replace(/(?:^|\s)\S/g, function (a) { return a.toLowerCase(); }); };
    return uncapitalize(mode.replace(/^Showdown$/, 'Solo Showdown').split(' ').join(''));
}
export function xpToHours(xp) {
    return xp / 220; // 145h for 30300 XP as measured by @schneefux
}
/**
 * Suffix num with SI unit
 * @param num number
 * @param digits digits after comma
 */
export function formatSI(num, digits) {
    var si = [
        { value: 1, symbol: '' },
        { value: 1E3, symbol: 'k' },
        { value: 1E6, symbol: 'M' },
    ];
    var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i;
    for (i = si.length - 1; i > 0; i--) {
        if (num >= si[i].value) {
            break;
        }
    }
    return (num / si[i].value).toFixed(digits).replace(rx, '$1') + si[i].symbol;
}
export var metaStatMaps = {
    labels: {
        trophies: 'Trophies',
        spTrophies: 'with Star Power',
        trophyChange: 'this season',
        winRate: 'Win Rate',
        rank1Rate: '#1 Rate',
        level: 'Avg. Level',
        starRate: 'Star Player',
        picks: 'Picks',
        pickRate: 'Pick Rate',
        pickRate_boss: 'Boss Pick Rate',
        useRate: 'Use Rate',
        duration: 'Duration',
        duration_boss: 'Boss Duration',
        rank: 'Avg. Rank',
        rank1: '#1 recorded',
        wins: 'Wins recorded',
        highestTrophies: 'Highest Trophies',
        powerPlayPoints: 'Power Play Points',
        highestPowerPlayPoints: 'Highest Power Play Points',
        expLevel: 'EXP Level',
        victories: '3v3 Wins',
        soloVictories: 'Solo Showdown Wins',
        duoVictories: 'Duo Showdown Wins'
    },
    labelsShort: {
        trophies: 'Trophies',
        spTrophies: 'with Star Power',
        trophyChange: 'this season',
        winRate: 'Win',
        rank1Rate: 'SD Win',
        level: 'Level',
        starRate: 'Star',
        picks: 'Picks',
        pickRate: 'Picked',
        useRate: 'Used',
        duration: 'Duration',
        rank: 'Rank',
        rank1: 'Rank 1',
        wins: 'Wins'
    },
    descriptions: {
        pickRate: 'The Pick Rate tells you the % of battles this Brawler appears in.',
        useRate: 'The Use Rate measures the popularity of a Brawler, adjusted to how many players unlocked them. It is the main statistic Supercell uses to balance Brawlers.',
        rank: 'The Average Rank tells you what place the Brawler is ranked in Showdown on average.',
        rank1Rate: 'The #1 Rate tells you the % of Showdown battles a Brawler is #1.',
        wins: 'The number of Wins recorded ranks Brawlers high who are played a lot and win a lot.',
        winRate: 'The Win Rate tells you the % of battles this Brawler wins or ranks high.',
        starRate: 'The Star Rate tells you the % of battles this Brawler becomes Star Player.',
        trophies: 'The amount of Trophies tells you how many trophies players have with this Brawler on average.',
        duration: 'The Duration tells you how long battles with this Brawler last on average.'
    },
    icons: {
        trophies: 'trophy',
        spTrophies: 'starpower',
        trophyChange: 'trophy',
        winRate: '📈',
        rank1Rate: '📈',
        level: '🏅',
        starRate: '⭐',
        picks: '👇',
        useRate: '🎯',
        pickRate: '👇',
        pickRate_boss: '👇',
        duration: '⏰',
        duration_boss: '⏰',
        rank: 'leaderboards',
        rank1: '🏅',
        wins: '🏅'
    },
    formatters: {
        trophies: function (n) { return Math.round(n); },
        spTrophies: function (n) { return Math.round(n); },
        trophyChange: function (n) { return n <= 0 ? Math.round(n) : "+" + Math.round(n); },
        winRate: function (n) { return Math.round(100 * n * 10) / 10 + "%"; },
        rank1Rate: function (n) { return Math.round(100 * n * 100) / 100 + "%"; },
        starRate: function (n) { return Math.round(100 * n * 10) / 10 + "%"; },
        picks: function (n) { return Math.round(100 * n) + "%"; },
        useRate: function (n) { return Math.round(100 * n * 100) / 100 + "%"; },
        pickRate: function (n) { return Math.round(100 * n * 100) / 100 + "%"; },
        pickRate_boss: function (n) { return Math.round(100 * n) + "%"; },
        duration: function (n) { return Math.floor(n / 60) + ":" + Math.floor(n % 60).toString().padStart(2, '0'); },
        duration_boss: function (n) { return Math.floor(n / 60) + ":" + Math.floor(n % 60).toString().padStart(2, '0'); },
        rank: function (n) { return n === null ? 'N/A' : n.toFixed(2); },
        level: function (n) { return n.toFixed(2); },
        rank1: function (n) { return formatSI(n, 1); },
        wins: function (n) { return formatSI(n, 1); }
    },
    signs: {
        trophies: -1,
        spTrophies: -1,
        trophyChange: -1,
        winRate: -1,
        rank1Rate: -1,
        starRate: -1,
        useRate: -1,
        pickRate: -1,
        pickRate_boss: -1,
        duration: +1,
        duration_boss: +1,
        rank: +1,
        level: -1,
        rank1: -1,
        wins: -1
    },
    propPriority: ['winRate', 'wins', 'rank1', 'duration', 'useRate', 'pickRate']
};
/**
 * Get brawlers by event: {
 *  [eventId]: [
 *    brawler id,
 *    brawler name,
 *    brawler stats,
 *    sort prop
 *  ] }
 * sorted by the preferred prop according to propPriority
 */
export function getBest(meta) {
    return __spreadArrays(Object.entries(meta)).reduce(function (top, _a) {
        var _b;
        var key = _a[0], entry = _a[1];
        return (__assign(__assign({}, top), (_b = {}, _b[key] = __spreadArrays(Object.entries(entry.brawlers)).map(function (_a) {
            var brawlerId = _a[0], brawler = _a[1];
            return ({
                id: brawlerId,
                title: brawler.name,
                brawler: brawlerId,
                sampleSize: brawler.sampleSize,
                stats: brawler.stats,
                sortProp: metaStatMaps.propPriority.find(function (prop) { return prop in brawler.stats; })
            });
        })
            .sort(function (brawler1, brawler2) { return brawler2.stats[brawler2.sortProp] - brawler1.stats[brawler1.sortProp]; }), _b)));
    }, {});
}
export function getBestBrawlers(brawlers) {
    var sampleSizeThreshold = 300;
    brawlers = brawlers.filter(function (brawler) { return brawler.sampleSize >= sampleSizeThreshold; });
    if (brawlers.length == 0) {
        return [];
    }
    var sortProp = metaStatMaps.propPriority.find(function (prop) { return prop in brawlers[0].stats; });
    brawlers.sort(function (brawler1, brawler2) { return brawler2.stats[sortProp] - brawler1.stats[sortProp]; });
    return brawlers;
}
export function getBestBrawlersByEachMetric(brawlers) {
    var props = Object.keys(metaStatMaps.labels);
    var max = {};
    brawlers.forEach(function (entry) {
        props.forEach(function (prop) {
            if ((!(prop in max) || max[prop].stats[prop] < entry.stats[prop]) &&
                entry.stats[prop] !== undefined && entry.stats[prop] !== 0) {
                max[prop] = entry;
            }
        });
    });
    return max;
}
export function getMostPopular(meta) {
    return __spreadArrays(Object.entries(meta)).reduce(function (top, _a) {
        var _b;
        var key = _a[0], entry = _a[1];
        return (__assign(__assign({}, top), (_b = {}, _b[key] = __spreadArrays(Object.entries(entry.brawlers)).map(function (_a) {
            var brawlerId = _a[0], brawler = _a[1];
            return ({
                id: brawlerId,
                title: brawler.name,
                brawler: brawlerId,
                sampleSize: brawler.sampleSize,
                stats: brawler.stats,
                sortProp: 'useRate'
            });
        })
            .sort(function (brawler1, brawler2) { return brawler2.stats[brawler2.sortProp] - brawler1.stats[brawler1.sortProp]; }), _b)));
    }, {});
}
export function formatAsJsonLd(event) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        'name': formatMode(event.mode) + " - " + event.map,
        'startDate': event.start,
        'endDate': event.end,
        'eventAttendanceMode': 'https://schema.org/OnlineEventAttendanceMode',
        'eventStatus': 'https://schema.org/EventScheduled',
        'url': "/tier-list/map/" + event.id,
        'image': [process.env.mediaUrl + "/tier-list/map/" + event.id + ".png"],
        'location': {
            '@type': 'VirtualLocation',
            'url': "/tier-list/map/" + event.id
        },
        'description': event.map + " is a Brawl Stars " + formatMode(event.mode) + " map."
    };
}
export function sloppyParseFloat(number) {
    return Math.floor(parseFloat(number) * 10000) / 10000;
}
/**
 * Throw if a tag is invalid.
 * Make sure tag starts with a hash.
 */
export function validateTag(tag) {
    if (!/^#?[0289PYLQGRJCUV]{3,}$/.test(tag)) {
        throw new Error('Invalid tag ' + tag);
    }
    if (!tag.startsWith('#')) {
        return '#' + tag;
    }
    return tag;
}
// in clickhouse SQL (tag has to start with '#'):
/*
arraySum((c, i) -> (position('0289PYLQGRJCUV', c)-1)*pow(14, length(player_club_tag)-i-1-1), arraySlice(splitByString('', player_club_tag), 2), range(if(player_club_tag <> '', toUInt64(length(player_club_tag)-1), 0))) as player_club_id,
*/
/**
 * Encode tag string into 64bit unsigned integer string.
 */
export function tagToId(tag) {
    if (!/^#?[0289PYLQGRJCUV]{3,}$/.test(tag)) {
        throw new Error('Cannot encode tag ' + tag);
    }
    if (tag.startsWith('#')) {
        tag = tag.substring(1);
    }
    var result = tag.split('').reduce(function (sum, c) { return sum * BigInt(14) + BigInt('0289PYLQGRJCUV'.indexOf(c)); }, BigInt(0));
    return result.toString();
}
/**
 * Decode 64bit unsigned integer string into tag string with hash.
 */
export function idToTag(idString) {
    var id = BigInt(idString);
    var tag = '';
    while (id != BigInt(0)) {
        var i = Number(id % BigInt(14));
        tag = '0289PYLQGRJCUV'[i] + tag;
        id /= BigInt(14);
    }
    return '#' + tag;
}
/*
  in SQL:
    date_add(from_days(ceil(to_days(date_sub(date_sub(timestamp, interval 8 hour), interval 1 day)) / 14) * 14 + 2), interval 8 hour)
  in clickhouse SQL:
    addHours(addDays(toStartOfInterval(subtractDays(subtractHours(timestamp, 8), 4), interval 336 hour, 'UTC'), 14+4), 8)
*/
/**
 * Round timestamp up to next trophy season interval.
 * @param timestamp
 */
export function getSeasonEnd(timestamp) {
    var trophySeasonEnd = new Date(Date.parse('2020-07-13T08:00:00Z'));
    var diff = timestamp.getTime() - trophySeasonEnd.getTime();
    var seasonsSince = Math.ceil(diff / 1000 / 60 / 60 / 24 / 7 / 2);
    trophySeasonEnd.setUTCDate(trophySeasonEnd.getUTCDate() + seasonsSince * 7 * 2);
    return trophySeasonEnd;
}
export function getCurrentSeasonEnd() {
    return getSeasonEnd(new Date());
}
export function formatClickhouse(timestamp) {
    return timestamp.toISOString()
        .slice(0, 19) // remove fractions and time zone
        .replace('T', ' ');
}
export function formatClickhouseDate(timestamp) {
    return timestamp.toISOString()
        .slice(0, 10) // remove fractions, day and time zone
        .replace('T', ' ');
}
export var measurementMap = {
    winRate: 'battle_victory',
    useRate: 'picks_weighted',
    pickRate: 'picks',
    starRate: 'battle_starplayer',
    rank1Rate: 'battle_rank1',
    duration: 'battle_duration'
};
export var measurementOfTotal = {
    winRate: false,
    useRate: true,
    pickRate: true,
    starRate: false,
    rank1Rate: false,
    duration: false
};
export function compare(entry1, entry2, stat) {
    var sign = metaStatMaps.signs[stat];
    var e1stat = Number.parseFloat((entry1.stats[stat] || 0).toString());
    var e2stat = Number.parseFloat((entry2.stats[stat] || 0).toString());
    return sign * (e1stat - e2stat);
}
export function compare1(stat) {
    return function (entry1, entry2) { return compare(entry1, entry2, stat); };
}
