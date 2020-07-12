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
        pickRate: 'Pick Rate',
        pickRate_boss: 'Boss Pick Rate',
        duration: 'Duration',
        duration_boss: 'Boss Duration',
        rank: 'Avg. Rank',
        rank1: '#1 recorded',
        wins: 'Wins recorded'
    },
    labelsShort: {
        trophies: 'Trophies',
        spTrophies: 'with Star Power',
        trophyChange: 'this season',
        winRate: 'Win',
        rank1Rate: 'SD Won',
        level: 'Level',
        starRate: 'Stars',
        pickRate: 'Picked',
        duration: 'Duration',
        rank: 'Rank',
        rank1: 'Rank 1',
        wins: 'Wins'
    },
    descriptions: {
        pickRate: 'The Pick Rate tells you the % of battles this Brawler appears in.',
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
        winRate: function (n) { return Math.round(100 * n) + "%"; },
        rank1Rate: function (n) { return Math.round(100 * n) + "%"; },
        starRate: function (n) { return Math.round(100 * n) + "%"; },
        pickRate: function (n) { return Math.round(100 * n) + "%"; },
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
        pickRate: -1,
        pickRate_boss: -1,
        duration: +1,
        duration_boss: +1,
        rank: +1,
        level: -1,
        rank1: -1,
        wins: -1
    },
    propPriority: ['winRate', 'wins', 'rank1', 'duration', 'pickRate']
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
                sortProp: 'pickRate'
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
