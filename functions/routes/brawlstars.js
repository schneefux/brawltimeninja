const cors = require('cors');
const express = require('express');
const BrawlStars = require('brawlstars');
const cacheManager = require('cache-manager');
const fsStore = require('cache-manager-fs-hash');

const cacheSeconds = 60*5;
const cachePath = process.env.CACHE_PATH || 'cache';
const cacheDisable = !!process.env.CACHE_DISABLE;
const token = process.env.BRAWLSTARS_TOKEN;
if (token == undefined) throw new Error('Please set $BRAWLSTARS_TOKEN!');

const cache = cacheDisable ?
  cacheManager.caching({ store: 'memory', max: 0 }) :
  cacheManager.caching({
    store: fsStore,
    options: { path: cachePath, subdirs: true, },
  });
const client = new BrawlStars.Client({ token });
const router = express.Router();

router.options('*', cors());

router.get('/featured-players', cors(), async (req, res) => {
  res.json([{
    name: 'xXcuzMePlisThXx',
    tag: 'V8LLPPC'
  }, {
    name: 'Keith',
    tag: '2Y02L28'
  }, {
    name: 'Landi',
    tag: 'V9QGJY9'
  }]);
});

router.get('/player/:tag', cors(), async (req, res, next) => {
  Promise.resolve().then(async function() {
    const tag = req.params.tag;
    const data = await cache.wrap(`brawlstars-player-${tag}`, async () => {
      const player = await client.getPlayer(tag);

      const heroes = {};
      player.brawlers.forEach((brawler) => {
        const brawlerId = brawler.name.toLowerCase().replace(' ', '_');
        heroes[brawlerId] = {
          label: brawler.name,
          icon: `/images/brawlstars/heroes/icon/${brawlerId}.png`,
          stats: {
            trophies: {
              label: 'Current Trophies',
              value: brawler.trophies,
              icon: '/images/brawlstars/icon/trophy.png'
            },
            maxTrophies: {
              label: 'Max Trophies',
              value: brawler.highestTrophies,
              icon: '/images/brawlstars/icon/trophy.png'
            },
            level: {
              label: 'Power Level',
              value: brawler.level,
              icon: brawler.level == 10?
                '/images/brawlstars/icon/starpower.png'
                :'/images/brawlstars/icon/powerpoint.png'
            }
          }
        };
      });

      return {
        tag: player.tag,
        name: player.name,
        stats: {
          trophies: {
            label: 'Current Trophies',
            value: player.trophies
          },
          highestTrophies: {
            label: 'Max Trophies',
            value: player.highestTrophies
          },
          expLevel: {
            label: 'Experience Level',
            value: player.expLevel
          }
        },
        heroes,
        modes: {
          '3v3': {
            label: '3v3',
            icon: '/images/brawlstars/mode/icon/gemgrab.png',
            background: '/images/brawlstars/mode/background/gemgrab.png',
            stats: {
              victories: {
                label: 'Victories',
                value: player.victories,
              }
            }
          },
          'soloShowdown': {
            label: 'Solo Showdown',
            icon: '/images/brawlstars/mode/icon/showdown.png',
            background: '/images/brawlstars/mode/background/showdown.png',
            stats: {
              victories: {
                label: 'Victories',
                value: player.soloShowdownVictories,
              }
            }
          },
          'duoShowdown': {
            label: 'Duo Showdown',
            icon: '/images/brawlstars/mode/icon/duoshowdown.png',
            background: '/images/brawlstars/mode/background/showdown.png',
            stats: {
              victories: {
                label: 'Victories',
                value: player.duoShowdownVictories,
              }
            }
          },
          'bossfight': {
            label: 'bossfight',
            icon: '/images/brawlstars/mode/icon/bossfight.png',
            background: '/images/brawlstars/mode/background/bossfight.png',
            stats: {
              minutes: {
                label: 'survived',
                value: player.bestTimeAsBoss,
              }
            }
          },
          'roborumble': {
            label: 'Robo Rumble',
            icon: '/images/brawlstars/mode/icon/roborumble.png',
            background: '/images/brawlstars/mode/background/roborumble.png',
            stats: {
              minutes: {
                label: 'survived',
                value: player.bestRoboRumbleTime,
              }
            }
          },
        },
      };
    }, { ttl: cacheSeconds });

    res.set('Cache-Control', `public, max-age=${cacheSeconds}`);
    res.json(data);
  }).catch((error) => {
    if (error == 'Error: Invalid Tag.') {
      res.status(404);
    } else {
      if (error.response != undefined) {
        console.error(error.response.text);
        res.status(error.response.status);
        res.json({ error: error.response.statusText });
      } else {
        console.error(error);
        res.status(400);
        res.json({ error: '' });
      }
      next(error);
    }
  });
});

module.exports = router;
