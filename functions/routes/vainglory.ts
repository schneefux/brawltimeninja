import Router from 'koa-router';
import { Player as VaingloryPlayer, ResponseCollection } from '../model/VaingloryPlayer';
import { Hero, PlayerStatistic, Mode, Player } from '../model/Player';
import { request } from '../util';

const token = process.env.VAINGLORY_TOKEN || '';
if (token == '') throw new Error('Please set $VAINGLORY_TOKEN!');
const apiBase = 'https://api.dc01.gamelockerapp.com';

const router = new Router();

router.get('/labels', async (ctx, next) => {
  ctx.body = {
    'appTitle': 'Vainglory',
  };
  await next();
});

router.get('/featured-players', async (ctx, next) => {
  ctx.body = [{
    name: 'shutterfly',
    tag: 'shutterfly'
  }];
  await next();
});

router.get('/player/:name', async (ctx, next) => {
  const players = await request<ResponseCollection<VaingloryPlayer>>(
    '/shards/eu/players',
    apiBase,
    { 'filter[playerNames]': ctx.params.name },
    {
      'X-Title-Id': 'semc-vainglory',
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.api+json',
    }
  );
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

  ctx.set('Cache-Control', 'public, max-age=300');
  ctx.body = data;
});

export default router;
