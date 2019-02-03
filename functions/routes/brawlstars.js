const cors = require('cors');
const express = require('express');
const BrawlStars = require('brawlstars');

const token = process.env.BRAWLSTARS_TOKEN;
if (token == undefined) throw new Error('Please set $BRAWLSTARS_TOKEN!');

const client = new BrawlStars.Client({ token });
const router = express.Router();

router.options('*', cors());

router.get('/player/:tag', cors(), async (req, res) => {
  // TODO mock data for testing
  res.json({
    tag: req.params.tag,
    name: 'TestPlayer1',
    modes: {
      '3v3': {
        label: '3v3',
        icon: '/images/brawlstars/mode/icon/gemgrab.png',
        background: '/images/brawlstars/mode/background/gemgrab.png',
        stats: {
          victories: {
            label: 'Victories',
            value: 1234,
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
            value: 34,
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
            value: 12,
          }
        }
      },
    },
    heroes: {
      'spike': {
        label: 'Spike',
        icon: '/images/brawlstars/heroes/icon/spike.png',
        stats: {
          trophies: {
            label: 'Current',
            value: 432,
            icon: '/images/brawlstars/icon/trophy.png'
          },
          maxTrophies: {
            label: 'Max',
            value: 500,
            icon: '/images/brawlstars/icon/trophy.png'
          }
        }
      },
      'barley': {
        label: 'Barley',
        icon: '/images/brawlstars/heroes/icon/barley.png',
        stats: {
          trophies: {
            label: 'Current',
            value: 321,
            icon: '/images/brawlstars/icon/trophy.png'
          }
        }
      }
    }
  });
  return;

  try {
    const player = await client.getPlayer(req.params.tag);
    res.json({
      tag: player.tag,
      name: player.name,
      victoriesByMode: {
        '3v3': player.victories,
        soloShowdown: player.soloShowdownVictories,
        duoShowdown: player.duoShowdownVictories
      }
    });
  } catch (error) {
    if (error.response != undefined) {
      console.error(error.response.text);
      res.status(error.response.status);
      res.json({ error: error.response.statusText });
    } else {
      console.error(error);
      res.status(400);
      res.json({ error: '' });
    }
  }
});

module.exports = router;
