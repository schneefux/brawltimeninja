import Router from 'koa-router';
import {
  Player as VaingloryPlayer,
  Match as VaingloryMatch,
  Roster as VaingloryRoster,
  Participant as VaingloryParticipant,
  ResponseCollection,
  Entity,
  EntityRelation,
} from '../model/VaingloryPlayer';
import { Hero, PlayerStatistic, Mode, Player } from '../model/Player';
import { request } from '../util';

const token = process.env.VAINGLORY_TOKEN || '';
if (token == '') throw new Error('Please set $VAINGLORY_TOKEN!');
const apiBase = 'https://api.dc01.gamelockerapp.com';

const router = new Router();

router.get('/labels', async (ctx, next) => {
  ctx.body = {
    'appTitle': 'Vainglory',
    'heroes': 'Heroes',
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

function getPlayerStatistics(name: string) {
  return request<ResponseCollection<VaingloryPlayer, null>>(
    '/shards/eu/players',
    apiBase,
    { 'filter[playerNames]': name },
    {
      'X-Title-Id': 'semc-vainglory',
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.api+json',
    }
  ).then((response) => response.data[0]);
}

async function getMatchStatistics(id: string) {
  return request<ResponseCollection<VaingloryMatch, VaingloryParticipant|VaingloryRoster>>(
    '/shards/eu/matches',
    apiBase,
    { 'filter[playerIds]': id },
    {
      'X-Title-Id': 'semc-vainglory',
      'Authorization': 'Bearer ' + token,
      'Accept': 'application/vnd.api+json',
    }
  ).then((response) => {
    const participants = (response.included
      .filter((entityLike: EntityRelation) => entityLike.type == 'participant') as VaingloryParticipant[])
      .filter((participant: VaingloryParticipant) => participant.relationships.player.data.id == id);

    const lastMatchStatsByHero = new Map<string, {
      win: boolean;
      kills: number;
      deaths: number;
      assists: number;
      farm: number;
    }>();
    participants.forEach((participant) => {
      const hero = participant.attributes.actor.slice(1, -1);
      const pas = participant.attributes.stats;
      if (!lastMatchStatsByHero.has(hero)) {
        lastMatchStatsByHero.set(hero, {
          win: pas.winner,
          kills: pas.kills,
          deaths: pas.deaths,
          assists: pas.assists,
          farm: pas.farm,
        });
      }
    });

    return [...lastMatchStatsByHero.entries()];
  }).catch(() => []);
}

router.get('/player/:name', async (ctx, next) => {
  const player = await getPlayerStatistics(ctx.params.name);
  const matchStatistics = await getMatchStatistics(player.id);

  const heroes = {} as { [id: string]: Hero };
  matchStatistics.forEach(([hero, last]) => {
    heroes[hero] = {
      label: hero,
      icon: `/images/vainglory/heroes/icon/${hero}.jpg`,
      stats: {
        lastResult: {
          label: 'last result',
          value: last.win? 'WIN' : 'LOSS',
          icon: '',
        },
        lastKda: {
          label: 'last KDA',
          value: `${last.kills}/${last.deaths}/${last.assists}`,
          icon: '',
        },
        lastFarm: {
          label: 'last farm',
          value: last.farm,
          icon: '',
        }
      }
    } as Hero;
  });

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
