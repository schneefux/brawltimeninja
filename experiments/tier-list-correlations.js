const brawlers = ['amber', 'jacky', 'gene', 'tara', 'carl', 'max', 'spike', 'piper', 'bo', 'frank', 'nani', 'barley', 'pam', 'mr. p', 'sandy', 'poco', 'rosa', 'nita', 'bea', 'brock', 'emz', 'surge', 'jessie', 'colette', 'rico', 'bibi', 'penny', 'dynamike', 'darryl', 'sprout', 'tick', 'crow', 'el primo', 'bull', 'shelly', 'mortis', 'leon', 'gale', 'colt', '8-bit']

const overallTierLists = {
  // Tom Brawl Stars, 2020-11-03 https://www.youtube.com/watch?v=lFZsgOmihoM
  tom: ['shelly', 'nita', 'jessie', 'crow', 'leon', 'dyna', 'colt', 'penny', 'poco', 'el primo', 'rosa', 'frank', 'bull', 'darryl', 'bibi', 'jacky', 'mr. p', 'emz', 'rico', 'bo', 'gale', 'piper', 'brock', 'mortis', 'sandy', '8-bit', 'nani', 'bea', 'pam', 'tara', 'tick', 'surge', 'carl', 'barley', 'sprout', 'colette', 'gene', 'max', 'spike', 'amber'].reverse(),

  // KairosTime V9 Overall, https://www.youtube.com/watch?v=DRGMUUdyzf8
  kairos: ['darryl', 'leon', 'spike', 'pam', 'mortis', 'brock', 'rico', 'poco', 'colt', 'bull', 'jessie', 'nita', 'crow', 'bo', 'tara', 'barley', 'shelly', 'dynamike', 'el primo', 'frank', 'piper', 'jessie'],

  // Landi, https://www.youtube.com/watch?v=1Fk3gQMUVtk
  landi: ['shelly', 'el primo', 'rosa', 'jacky', 'poco', 'bibi', 'nita', 'piper', 'nani', 'bull', 'carl', 'emz', 'rico', 'dynamike', 'frank', 'gale', 'leon', 'darryl', 'pam', 'jessie', 'tick', 'surge', 'colette', '8-bit', 'bea', 'tara', 'mr. p', 'brock', 'bo', 'colt', 'sprout', 'barley', 'gene', 'penny', 'sandy', 'crow', 'surge', 'mortis' , 'spike', 'amber'].reverse(),

  // Jo Jonas https://www.youtube.com/watch?v=IDARFfZv7Ko
  jojonas: ['poco', 'mortis', 'shelly', 'bull', 'tick', 'jessie', 'colt', 'frank', 'penny', 'el primo', 'rosa', 'piper', 'darryl', 'rico', 'dynamike', 'leon', 'sandy', 'nani', 'surge', '8-bit', 'bo', 'tara', 'jacky', 'brock', 'bea', 'nita', 'sprout', 'barley', 'emz', 'bibi', 'gale', 'pam', 'colette', 'crow', 'spike', 'max', 'carl', 'gene', 'mr. p', 'amber'].reverse(),

  // u/KunmiTheBoss
  kunmi: ['amber', 'carl', 'emz', 'gene', 'max', 'spike', 'brock', 'pam', 'sandy', 'sprout', 'tara', '8-bit', 'barley', 'bea', 'bibi', 'bo', 'gale', 'jacky', 'mr. p', 'nani', 'poco', 'surge', 'tick', 'bull', 'darryl', 'el primo', 'emz', 'frank', 'mortis', 'nita', 'penny', 'piper', 'rico', 'rosa', 'colt', 'dynamike', 'leon', 'crow', 'jessie', 'shelly'],

  // Brawl Time Ninja, current season, 2020-11-06
  // sample size: 1M
  brawltime: ['amber', 'tara', 'colette', 'sandy', 'nita', 'spike', 'rosa', 'gene', 'gale', 'jacky', 'mr. p', 'poco', 'tick', 'jessie', 'frank', 'carl', 'surge', 'penny', 'el primo', 'bull', 'emz', 'max', 'sprout', 'bo', 'darryl', 'pam', 'leon', 'brock', '8-bit', 'nani', 'bea', 'piper', 'bibi', 'rico', 'shelly', 'crow', 'barley', 'colt', 'dynamike', 'mortis'],
  brawltime700: ['amber', 'sandy', 'gene', 'pam', 'spike', 'bea', 'brock', 'colette', 'barley', 'mr. p', 'nani', 'darryl', 'piper', 'carl', '8-bit', 'tara', 'surge', 'poco', 'penny', 'bo', 'jacky', 'frank', 'max', 'gale', 'bull', 'sprout', 'tick', 'rico', 'nita', 'jessie', 'el primo', 'emz', 'colt', 'rosa', 'leon', 'bibi', 'dynamike', 'shelly', 'crow', 'mortis'],
  //brawltimeWinrate: ['amber', 'sandy', 'nita', 'colette', 'tara', 'mr. p', 'jacky', 'rosa', 'gale', 'frank', 'spike', 'jessie', 'gene', 'carl', 'poco', 'emz', 'penny', '8-bit', 'surge', 'el primo', 'tick', 'bull', 'darryl', 'pam', 'sprout', 'bo', 'max', 'leon', 'nani', 'brock', 'rico', 'barley', 'bea', 'bibi', 'shelly', 'crow', 'piper', 'colt', 'dynamike', 'mortis'],
  //brawltime500: ['amber', 'tara', 'sandy', 'nita', 'mr. p', 'colette', 'spike', 'gene', 'rosa', 'jacky', 'carl', 'frank', 'gale', '8-bit', 'jessie', 'emz', 'penny', 'tick', 'poco', 'pam', 'darryl', 'bull', 'sprout', 'el primo', 'max', 'bo', 'surge', 'brock', 'bea', 'piper', 'leon', 'rico', 'nani', 'barley', 'bibi', 'crow', 'shelly', 'colt', 'dynamike', 'mortis'],
  // Brawl Time Ninja, current season, power play 500+ points, 2020-11-06
  // (2d until end of PP season)
  // sample size: 0.018M
  //brawltimePowerPlay500: ['amber', 'gene', 'max', 'spike', 'barley', 'tara', 'brock', 'sprout', 'bo', 'pam', 'carl', 'piper', 'nani', 'tick', 'jacky', 'surge', 'mortis', 'colette', 'rico', 'mr. p', 'bibi', '8-bit', 'rosa', 'penny', 'dynamike', 'darryl', 'bull', 'colt', 'sandy', 'emz', 'bea', 'frank', 'el primo', 'crow', 'poco', 'jessie', 'gale', 'leon', 'shelly', 'nita'],
  // Brawl Time Ninja, current season, power play, 2020-11-07
  // sample size: 0.066M
  brawltimePowerPlay: ['amber', 'tara', 'gene', 'bo', 'jacky', 'frank', 'spike', 'piper', 'max', 'nita', 'carl', 'rosa', 'poco', 'nani', 'sandy', 'barley', 'emz', 'pam', 'bea', 'surge', 'brock', 'mr. p', 'gale', 'jessie', 'leon', '8-bit', 'penny', 'bibi', 'colette', 'tick', 'darryl', 'crow', 'dynamike', 'sprout', 'el primo', 'rico', 'bull', 'mortis', 'shelly', 'colt'],
}

/* Brawl Ball Tier Lists */

const brawlBallTierlists = {
  // KairosTime V9 Brawl Ball, https://www.youtube.com/watch?v=DRGMUUdyzf8
  kairosBB: ['darryl', 'tara', 'nita', 'spike', 'jessie', 'leon', 'el primo', 'poco', 'rico', 'colt', 'pam', 'shelly', 'frank', 'bull', 'mortis'],

  // Brawl Capped v21, 300, "Tier List"
  // sample size: ~1M
  brawlcapped300: ['emz', 'jacky', 'nita', 'rosa', 'sandy', 'spike', 'tara', 'carl', 'emz', 'frank', 'max', 'mr. p', 'pam', '8-bit', 'bea', 'bull', 'darryl', 'el primo', 'gene', 'jessie', 'poco'],
  // Brawl Capped v21, 600, "Tier List"
  // sample size: ~0.6M
  brawlcapped600: ['8-bit', 'colette', 'emz', 'jacky', 'nita', 'pam', 'rosa', 'sandy', 'spike', 'barley', 'bea', 'carl', 'gene', 'max', 'mr. p', 'nani', 'tara', 'bo', 'bull', 'darryl', 'frank', 'gale', 'jessie', 'penny', 'rico'],

  // Brawl Lab 2020-11-06
  brawllab: ['8-bit', 'barley', 'pam', 'nita', 'mr. p', 'gene', 'sandy', 'emz', 'penny', 'jessie', 'carl', 'rosa', 'bea', 'spike', 'piper', 'rico', 'poco', 'bo', 'frank', 'darryl', 'bull', 'brock', 'max', 'leon', 'tara', 'colt', 'tick', 'bibi', 'dynamike', 'crow', 'shelly', 'el primo', 'mortis'],

  // Gaming Scan
  gamingScan: ['jacky', 'mr. p', 'sandy', 'bea', 'emz', 'spike', 'rosa', 'tara', 'pam', 'nita', 'frank', 'poco', 'darryl', 'carl', 'nani', 'gale', 'max', 'sprout', 'gene', 'bibi', 'penny', 'el primo', 'colt', 'jessie', 'rico', 'brock', 'crow', 'bo', 'bull'],

  // Brawl Ace 2020-11-06 Brawl Ball
  // sample size: ~0.5M
  brawlace: ['dynamike', 'tick', 'mortis', 'shelly', 'tara', 'poco', 'piper', 'crow', 'amber', 'spike', 'leon', 'colt', 'surge', 'rico', 'brock', 'bea', 'sprout', 'el primo', 'max', 'emz', 'darryl', 'bo', 'bull', 'gene', 'bibi', 'rosa', 'frank', 'jessie', 'nita', 'pam', 'nani', 'colette', 'carl', 'jacky', 'penny', 'sandy', 'gale', 'barley', 'mr. p', '8-bit'],

  // Brawl Stats 2020-11-06, win rates, 600+
  // sample size: ~6M
  brawlstatsBB600: ['8-bit', 'amber', 'jacky', 'nita', 'sandy', 'pam', 'rosa', 'emz', 'mr. p', 'colette', 'gale', 'frank', 'tara', 'barley', 'gene', 'poco', 'bea', 'darryl', 'carl', 'spike', 'bull', 'jessie', 'penny', 'rico', 'nani', 'el primo', 'max', 'bibi', 'surge', 'shelly', 'bo', 'colt', 'brock', 'crow', 'tick', 'leon', 'piper', 'mortis', 'dynamike', 'sprout'],
  // Brawl Stats 2020-11-06, win rates, 300-600
  // sample size: ~12M
  brawlstatsBB300: ['amber', 'nita', 'sandy', 'colette', 'tara', 'frank', 'rosa', 'jacky', 'jessie', 'mr. p', 'poco', 'emz', 'gale', 'el primo', 'spike', 'pam', 'darryl', 'bull', 'max', 'shelly', 'bibi', 'crow', 'tick', 'leon', 'bea', 'carl', 'penny', 'surge', '8-bit', 'rico', 'bo', 'gene', 'mortis', 'colt', 'nani', 'brock', 'sprout', 'barley', 'dynamike', 'piper'],

  // Brawl Time Ninja, Brawl Ball, "update", 2020-11-06
  // sample size: 15M
  //brawltimeUpdateBBWinrate: ['amber', 'colette', 'sandy', 'nita', 'jacky', 'rosa', 'tara', 'frank', 'jessie', 'spike', 'gale', 'poco', 'emz', 'mr. p', 'el primo', 'bull', 'darryl', 'max', 'carl', 'pam', 'shelly', 'tick', 'bibi', 'gene', 'crow', 'penny', 'bea', 'bo', 'surge', 'leon', '8-bit', 'rico', 'colt', 'barley', 'nani', 'brock', 'sprout', 'mortis', 'dynamike', 'piper'],
  // Brawl Time Ninja, Brawl Ball, current season, 2020-11-06
  // sample size: 0.5M
  //brawltimeBBWinrate: ['amber', 'sandy', 'nita', 'jacky', 'colette', 'rosa', 'tara', 'gale', 'jessie', 'frank', 'mr. p', 'spike', 'poco', 'emz', 'gene', 'carl', 'bull', 'darryl', 'el primo', '8-bit', 'bea', 'surge', 'penny', 'max', 'shelly', 'rico', 'tick', 'leon', 'bibi', 'barley', 'pam', 'bo', 'crow', 'colt', 'sprout', 'brock', 'nani', 'dynamike', 'mortis', 'piper'],
  brawltimeBB: ['amber', 'nita', 'sandy', 'colette', 'jacky', 'rosa', 'tara', 'gale', 'frank', 'spike', 'jessie', 'poco', 'emz', 'mr. p', 'gene', 'carl', 'darryl', 'bull', 'el primo', 'bea', 'surge', 'max', 'shelly', 'penny', '8-bit', 'rico', 'bibi', 'leon', 'barley', 'pam', 'tick', 'bo', 'crow', 'colt', 'sprout', 'brock', 'nani', 'dynamike', 'mortis', 'piper'],
  // Brawl Time Ninja, Brawl Ball, current season, 2020-11-06, Power Play
  // sample size: 0.015M (too smalll)
  //brawltimePowerPlayBBWinrate: ['amber', 'gene', 'jacky', 'carl', 'barley', 'spike', 'bea', 'max', 'frank', 'tara', 'poco', 'darryl', 'rosa', 'nita', 'emz', 'sandy', 'bibi', 'bull', 'surge', 'jessie', 'el primo', 'crow', 'shelly', 'rico', 'bo', 'dynamike', 'leon', 'mortis', 'brock', 'penny', 'colt', 'gale', 'tick', 'pam', 'colette', 'mr. p', 'nani', 'sprout', '8-bit', 'piper'],
  brawltimePowerPlayBB: ['amber', '8-bit', 'jessie', 'nani', 'leon', 'brock', 'gene', 'spike', 'nita', 'jacky', 'barley', 'sprout', 'gale', 'piper', 'tara', 'carl', 'colette', 'max', 'bo', 'crow', 'frank', 'poco', 'dynamike', 'penny', 'bea', 'darryl', 'rosa', 'bibi', 'tick', 'mortis', 'emz', 'sandy', 'surge', 'bull', 'el primo', 'mr. p', 'pam', 'colt', 'rico', 'shelly'],
  // Brawl Time Ninja, Brawl Ball, current season, 2020-11-06, 500+
  // sample size: 0.4M
  //brawltimeBBWinrate500: ['amber', 'sandy', 'nita', 'jacky', 'colette', 'tara', 'rosa', 'frank', 'spike', 'gale', 'jessie', 'gene', 'emz', 'mr. p', 'poco', 'bea', 'carl', '8-bit', 'darryl', 'bull', 'el primo', 'rico', 'max', 'shelly', 'penny', 'surge', 'bibi', 'tick', 'pam', 'leon', 'barley', 'crow', 'bo', 'colt', 'sprout', 'brock', 'mortis', 'dynamike', 'nani', 'piper'],
  //brawltimeBBWinrate600Adj: ['amber', 'colette', 'sandy', 'nita', 'jacky', 'rosa', 'tara', 'frank', 'jessie', 'spike', 'gale', 'poco', 'emz', 'mr. p', 'el primo', 'darryl', 'bull', 'max', 'carl', 'pam', 'shelly', 'tick', 'bibi', 'gene', 'crow', 'penny', 'bea', 'surge', 'bo', 'leon', '8-bit', 'rico', 'colt', 'barley', 'nani', 'brock', 'sprout', 'mortis', 'dynamike', 'piper'],
  // Brawl Time Ninja, Brawl Ball, current season, 2020-11-06
  // sample size: 0.4M
  //brawltimeBBWins: ['mortis', 'el primo', 'shelly', 'tara', 'bibi', 'poco', 'frank', 'dynamike', 'bull', 'rico', 'darryl', 'amber', 'spike', 'rosa', 'max', 'colt', 'nita', 'gene', 'jacky', 'surge', 'jessie', 'bea', 'emz', 'colette', 'carl', 'gale', 'sandy', 'tick', 'bo', 'brock', 'barley', 'crow', 'pam', 'penny', 'sprout', 'leon', 'mr. p', '8-bit', 'nani', 'piper'],
  brawltimePowerPlayBBWins: ['shelly', 'spike', 'amber', 'el primo', 'tara', 'nita', 'gene', 'max', 'jessie', 'barley', 'dynamike', 'poco', 'frank', 'jacky', 'rico', 'bibi', 'mortis', 'rosa', 'carl', 'bull', 'surge', 'sandy', 'colt', 'emz', 'darryl', 'crow', 'bo', 'leon', 'bea', 'brock', 'penny', 'gale', 'tick', 'pam', 'colette', 'mr. p', 'nani', 'sprout', '8-bit', 'piper'],
  brawltimeBB700: ['gene', 'amber', 'sandy', 'bea', 'carl', 'colette', 'spike', 'max', 'poco', 'tara', 'jacky', 'barley', 'nita', 'darryl', 'jessie', 'leon', 'surge', 'rico', 'frank', 'rosa', 'mr. p', 'bull', '8-bit', 'pam', 'bo', 'el primo', 'nani', 'dynamike', 'piper', 'emz', 'sprout', 'shelly', 'penny', 'crow', 'brock', 'gale', 'bibi', 'colt', 'tick', 'mortis'],
  brawltimeBB700Wins: ['amber', 'spike', 'gene', 'tara', 'mortis', 'carl', 'max', 'bea', 'sandy', 'bull', 'poco', 'colette', 'rico', 'colt', 'surge', 'darryl', 'shelly', 'el primo', 'jacky', 'bibi', 'nita', 'frank', 'barley', 'dynamike', 'rosa', 'brock', 'leon', 'jessie', 'emz', 'tick', 'sprout', 'bo', 'crow', 'mr. p', '8-bit', 'gale', 'penny', 'pam', 'piper', 'nani'],
}

Object.values(brawlBallTierlists).forEach((tl) => {
  tl.forEach((b) => {
    if (!brawlers.includes(b)) {
      console.log('typo detected! ' + b)
    }
  })
})

const Statistics = require('statistics.js')
const RBO = require('./lib/rbo')

const toOrdinal = (list1, list2, key1, key2) => {
  if (list1.length <= list2.length) {
    return list1.map((b, index) => ({
      [key1]: index,
      [key2]: list2.indexOf(b),
    }))
  } else {
    return list2.map((b, index) => ({
      [key2]: index,
      [key1]: list1.indexOf(b),
    }))
  }
}

function calculateDistMat(tierlists) {
  const distMat = []
  const keys = Object.keys(tierlists)
  keys.forEach((key1) => {
    const row = []
    keys.forEach((key2) => {
      /*
      // weighted footrule distance
      // https://arxiv.org/pdf/1804.05420.pdf
      const weighted_footrule = (a, b, w) => a.map((e, index) => w(index) * Math.abs(index - b.indexOf(e))).reduce((sum, d) => sum + d, 0)
      const weighted_footrule_max = (a, w) => a.map((e, index) => w(index) * Math.abs(index - (a.length - index + 1))).reduce((sum, d) => sum + d, 0)
      const weighted_footrule_norm = (a, b, w) => weighted_footrule(a, b, w) / weighted_footrule_max(a, b, w)
      const dist = weighted_footrule_norm(list1, list2, (index) => (1/Math.log(index+2)))
      */
      /*
      // jaccard simialrity of top N
      const n = 20
      const list1 = tierlists[key1].slice(0, n)
      const list2 = tierlists[key2].slice(0, n)
      const isct = list1.filter(e => list2.includes(e)).length
      const dist = 1 - (isct / (n + n - isct))
      */

      // rank biased overlap
      // http://codalism.com/research/papers/wmz10_tois.pdf
      const rbo = new RBO(0.9) // p=0.9 -> top 10 get 86% the weight
      const rboSim = rbo.calculate(tierlists[key1], tierlists[key2])
      const dist = Math.round((1-rboSim) * 1000) / 1000

      row.push(dist)
      console.log(key1, key2, 1-dist)
    })
    distMat.push(row)
  })
  return [keys, distMat]
}

const [keys, distMat] = calculateDistMat(brawlBallTierlists)
const mds = require('./lib/mds')
const distMatM = mds.convertToMatrix(distMat)
const mdsPoints = mds.landmarkMDS(distMatM, 3)

const { plot } = require('nodeplotlib')
const trace = { x: [], y: [], z: [], text: [], type: 'scatter3d', mode: 'markers' }
mdsPoints.rowsIter((row, index) => {
  trace.x.push(row[0])
  trace.y.push(row[1])
  trace.z.push(row[2])
  trace.text.push(keys[index])
})
plot([trace])
