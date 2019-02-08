import cors from 'cors';
import express from 'express';
import Vainglory from 'vainglory';
import { Hero, PlayerStatistic, Mode, Player } from '../Player';

const token = process.env.VAINGLORY_TOKEN;
if (token == undefined) throw new Error('Please set $VAINGLORY_TOKEN!');

const client = new Vainglory(token, { region: 'eu' });
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
    const name = req.params.name;
    const players = await client.players.getByName([name]);
    const player = players.data[0];

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
