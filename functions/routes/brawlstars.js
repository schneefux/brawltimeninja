const cors = require('cors');
const express = require('express');
const BrawlStars = require('brawlstars');

const token = process.env.BRAWLSTARS_TOKEN;
if (token == undefined) throw new Error('Please set $BRAWLSTARS_TOKEN!');

const client = new BrawlStars.Client({ token });
const router = express.Router();

router.options('*', cors());

router.get('/player/:tag', cors(), async (req, res) => {
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
