import Router from 'koa-router';
import {
  Player as ApexlegendsPlayer,
  PlayerStub as ApexlegendsPlayerStub,
  Characters as ApexlegendsCharacters,
} from '../model/ApexlegendsPlayer';
import { Hero, PlayerStatistic, Mode, Player } from '../model/Player';
import { request, flatten2d, capitalize } from '../util';

const apiBase = 'https://apextab.com/api/';

const router = new Router();

router.get('/labels', async (ctx, next) => {
  ctx.body = {
    'appTitle': 'Apex Legends',
    'heroes': 'Characters',
    'userId': 'name',
  };
  await next();
});

router.get('/featured-players', async (ctx, next) => {
  ctx.body = [{
    name: 'Ballabriggsx',
    tag: 'Ballabriggsx'
  }, {
    name: 'BallerInGame',
    tag: 'BallerInGame'
  }];

  await next();
});

const platforms = ['pc', 'psn', 'xbl'];
function getPlayerStatistics(name: string) {
  return Promise.all(platforms.map((platform) =>
    request<{ results: ApexlegendsPlayerStub[] }>(
      'search.php',
      apiBase,
      { search: name, platform },
      { }
    ).then((response) =>
        response.results.filter((player) => player.name == name))
     .catch(() => [] as ApexlegendsPlayerStub[])
  )).then(flatten2d)
    .then((players) => players.length > 0 ? players[0] : null);
}

router.get('/player/:name', async (ctx, next) => {
  const playerStub = await getPlayerStatistics(ctx.params.name);
  if (playerStub == null) {
    await next();
    return;
  }

  const player = await request<ApexlegendsPlayer>(
    'player.php',
    apiBase,
    { aid: playerStub.aid },
    { }
  );

  const statProps = ['kills', 'headshots', 'matches', 'damage'];

  const heroes = {} as { [id: string]: Hero };
  ApexlegendsCharacters.forEach((character) => {
    const hero = {
      label: character,
      icon: '',
      stats: {},

    } as Hero;
    statProps.forEach((statProp) => {
      const value = player[<keyof ApexlegendsPlayer>`${statProp}_${character}`];
      if (! (value != null && (typeof value == 'number' || typeof value == 'string'))) {
          return;
      }
      hero.stats[statProp] = {
        label: capitalize(statProp),
        value,
        icon: ''
      };
    });

    heroes[character] = hero;
  });

  const stats = {
    skillRatio: {
      label: 'Skill Ratio',
      value: player.skillratio
    },
    level: {
      label: 'Level',
      value: player.level
    },
    globalRank: {
      label: 'Global Rank',
      value: `#${player.globalrank}`
    },
  } as { [id: string]: PlayerStatistic };
  statProps.forEach((statProp) => {
    const value = player[<keyof ApexlegendsPlayer>statProp];
    if (! (value != null && (typeof value == 'number' || typeof value == 'string'))) {
        return;
    }
    stats[statProp] = {
      label: capitalize(statProp),
      value
    };
  });

  const minutesSpent = 0;

  const heroStats = {
  } as { [id: string]: PlayerStatistic };

  const data = {
    id: player.aid,
    name: player.name,
    minutesSpent,
    heroes,
    heroStats,
    stats,
    modes: {
    },
  } as Player;

  ctx.set('Cache-Control', 'public, max-age=300');
  ctx.body = data;
  await next();
});

export default router;
