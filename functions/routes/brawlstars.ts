import Router from 'koa-router';
import { Player as BrawlstarsPlayer } from '../model/BrawlstarsPlayer';
import { Hero, PlayerStatistic, Mode, Player } from '../model/Player';
import { request } from '../util';

const token = process.env.BRAWLSTARS_TOKEN || '';
if (token == '') throw new Error('Please set $BRAWLSTARS_TOKEN!');
const apiBase = 'https://brawlapi.cf/api/';

const router = new Router();

router.get('/labels', async (ctx, next) => {
  ctx.body = {
    'appTitle': 'Brawl Stars',
  };
  await next();
});

router.get('/featured-players', async (ctx, next) => {
  ctx.body = [{
    name: 'xXcuzMePlisThXx',
    tag: 'V8LLPPC'
  }, {
    name: 'Keith',
    tag: '2Y02L28'
  }, {
    name: 'Landi',
    tag: 'V9QGJY9'
  }];

  await next();
});

router.get('/player/:tag', async (ctx, next) => {
  const player = await request('player', apiBase,
    { 'tag': ctx.params.tag },
    { 'Authorization': token }
  ) as BrawlstarsPlayer;

  const heroes = {} as { [id: string]: Hero };
  player.brawlers.forEach((brawler) => {
    const brawlerId = brawler.name.toLowerCase().replace(' ', '_');
    heroes[brawlerId] = {
      label: brawler.name,
      icon: `/images/brawlstars/heroes/icon/${brawlerId}.png`,
      stats: {
        trophies: {
          label: 'Trophies',
          value: brawler.trophies,
          icon: '/images/brawlstars/icon/trophy.png'
        },
        maxTrophies: {
          label: 'Trophies Max',
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
    } as Hero;
  });

  const stats = {
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
    },
  } as { [id: string]: PlayerStatistic };

  if (player.club != undefined) {
    stats.clubName = {
      label: 'Club',
      value: player.club.name
    };
  }

  const minutesSpent =
    player.victories * 2 * 3 + // 50% win rate * 3mins
    player.soloShowdownVictories * 10 * 3 + // 1/10 win rate * 3mins
    player.duoShowdownVictories * 5 * 3 // 1/5 win rate * 3mins
  ;

  const data = {
    id: player.tag,
    name: player.name,
    minutesSpent,
    heroes,
    stats,
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
      } as Mode,
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
      } as Mode,
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
      } as Mode,
      'bossfight': {
        label: 'Bossfight',
        icon: '/images/brawlstars/mode/icon/bossfight.png',
        background: '/images/brawlstars/mode/background/bossfight.png',
        stats: {
          minutes: {
            label: 'survived',
            value: player.bestTimeAsBoss,
          }
        }
      } as Mode,
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
      } as Mode,
    },
  } as Player;

  ctx.set('Cache-Control', 'public, max-age=300');
  ctx.body = data;
});

export default router;
