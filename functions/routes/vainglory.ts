import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch';
import { strict as assert } from 'assert';
import { URLSearchParams, URL } from 'url';
import { VaingloryPlayer } from '../VaingloryPlayer';
import { Hero, PlayerStatistic, Mode, Player } from '../Player';

const token = process.env.VAINGLORY_TOKEN;
assert(token != undefined);
const apiBase = 'https://api.dc01.gamelockerapp.com';

const router = express.Router();

router.options('*', cors());

router.get('/featured-players', cors(), async (req, res) => {
  res.json([{
    name: 'shutterfly',
    tag: 'shutterfly'
  }]);
});

router.get('/player/:name', cors(), async (req, res, next) => {
  Promise.resolve().then(async function() {
    const url = new URL('/shards/eu/players', apiBase);
    const params = new URLSearchParams({
      'filter[playerNames]': req.params.name,
    });
    url.search = params.toString();
    const player = await fetch(url.toString(), {
      headers: {
        'X-Title-Id': 'semc-vainglory',
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.api+json',
      }
    }).then((res) => res.json())
      .then((res) => res.data[0] as VaingloryPlayer);

    const heroes = {} as { [id: string]: Hero };

    const stats = {
      skillTier: {
        label: 'Skill Tier',
        value: player.attributes.stats.skillTier
      },
    } as { [id: string]: PlayerStatistic };

    const minutesSpent = 1;

    const data = {
      id: player.id,
      name: player.attributes.name,
      minutesSpent,
      heroes,
      stats,
      modes: {
        casual: {
          label: '3v3 Casual',
          icon: '',
          background: '',
          stats: {
            played: {
              label: 'Games',
              value: player.attributes.stats.gamesPlayed.casual,
            }
          }
        } as Mode,
        ranked: {
          label: '3v3 Ranked',
          icon: '',
          background: '',
          stats: {
            played: {
              label: 'Games',
              value: player.attributes.stats.gamesPlayed.ranked,
            }
          }
        } as Mode,
      },
    } as Player;

    res.set('Cache-Control', 'public, max-age=300');
    res.json(data);
  }).catch((error) => {
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
  });
});

export default router;
