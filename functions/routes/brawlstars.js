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
    modeStats: {
      '3v3': {
        label: '3v3',
        victories: 1234,
        icon: '/images/brawlstars/mode/icon/gemgrab.png',
        background: '/images/brawlstars/mode/background/gemgrab.png',
      },
      'soloShowdown': {
        label: 'Solo Showdown',
        victories: 12,
        icon: '/images/brawlstars/mode/icon/showdown.png',
        background: '/images/brawlstars/mode/background/showdown.png',
      },
      'duoShowdown': {
        label: 'Duo Showdown',
        victories: 34,
        icon: '/images/brawlstars/mode/icon/duoshowdown.png',
        background: '/images/brawlstars/mode/background/showdown.png',
      },
    },
    heroStats: {
      'spike': {
        label: 'Spike',
        trophies: 432,
        icon: '/images/brawlstars/heroes/icon/spike.png'
      },
      'barley': {
        label: 'Barley',
        trophies: 321,
        icon: '/images/brawlstars/heroes/icon/barley.png'
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
