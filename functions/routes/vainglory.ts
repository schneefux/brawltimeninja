import Router from 'koa-router';
import fetch from 'node-fetch';
import { strict as assert } from 'assert';
import { URLSearchParams, URL } from 'url';
import { Player as VaingloryPlayer } from '../VaingloryPlayer';
import { Hero, PlayerStatistic, Mode, Player } from '../Player';

const token = process.env.VAINGLORY_TOKEN || '';
assert(token != '');
const apiBase = 'https://api.dc01.gamelockerapp.com';

const router = new Router();

router.get('/featured-players', async (ctx, next) => {
  ctx.body = [{
    name: 'shutterfly',
    tag: 'shutterfly'
  }];
  await next();
});

router.get('/player/:name', async (ctx, next) => {
  const url = new URL('/shards/eu/players', apiBase);
  const params = new URLSearchParams({
    'filter[playerNames]': ctx.params.name,
  });
  url.search = params.toString();
  const player = await fetch(url.toString(), {
    headers: {
      'X-Title-Id': 'semc-vainglory',
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.api+json',
    }
  }).then((res) => res.json())
    .then((res) => res.data[0]) as VaingloryPlayer;

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

  ctx.set('Cache-Control', 'public, max-age=300');
  ctx.body = data;
});

export default router;
