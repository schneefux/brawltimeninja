import Router from 'koa-router';

import BrawlstarsService from '../services/Brawlstars';

const service = new BrawlstarsService();

const router = new Router();

function getTrophyRangeLower(query: any) {
  if ('trophyrange' in query) {
    const [low, _] = query.trophyrange.split('-')
    return (parseInt(low) || 0).toString()
  }
  return '0'
}

function getTrophyRangeHigher(query: any) {
  if ('trophyrange' in query) {
    const [_, high] = query.trophyrange.split('-')
    if (high == 10) {
      return '99'
    }
    return (parseInt(high) || 99).toString()
  }
  return '99'
}

router.get('/player/:tag', async (ctx, next) => {
  try {
    ctx.body = await service.getPlayerStatistics(ctx.params.tag);
    ctx.set('Cache-Control', 'public, max-age=180');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/player/:tag/winrates', async (ctx, next) => {
  try {
    ctx.body = await service.getPlayerWinrates(ctx.params.tag);
    ctx.set('Cache-Control', 'public, max-age=180');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/player/:tag/history', async (ctx, next) => {
  try {
    ctx.body = await service.getPlayerHistory(ctx.params.tag);
    ctx.set('Cache-Control', 'public, max-age=180');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/events', async (ctx, next) => {
  try {
    ctx.body = await service.getAllEvents();
    ctx.set('Cache-Control', 'public, max-age=300');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/events/active', async (ctx, next) => {
  try {
    ctx.body = await service.getActiveEvents();
    ctx.set('Cache-Control', 'public, max-age=300');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/leaderboard/:metric', async (ctx, next) => {
  try {
    ctx.body = await service.getLeaderboard(ctx.params.metric);
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/meta/brawler', async (ctx, next) => {
  try {
    ctx.body = await service.getBrawlerMeta(getTrophyRangeLower(ctx.request.query), getTrophyRangeHigher(ctx.request.query));
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/brawler/:id', async (ctx, next) => {
  try {
    ctx.body = await service.getBrawlerStatistics(ctx.params.id);
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/meta/starpower', async (ctx, next) => {
  try {
    ctx.body = await service.getStarpowerMeta(getTrophyRangeLower(ctx.request.query), getTrophyRangeHigher(ctx.request.query));
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/meta/gadget', async (ctx, next) => {
  try {
    ctx.body = await service.getGadgetMeta(getTrophyRangeLower(ctx.request.query), getTrophyRangeHigher(ctx.request.query));
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/meta/map', async (ctx, next) => {
  try {
    ctx.body = await service.getMapMeta({ ...ctx.request.query }, getTrophyRangeLower(ctx.request.query), getTrophyRangeHigher(ctx.request.query));
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/meta/map/events', async (ctx, next) => {
  try {
    ctx.body = await service.getMapMeta({ current: 'true', upcoming: 'true' }, getTrophyRangeLower(ctx.request.query), getTrophyRangeHigher(ctx.request.query));
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/meta/map/mode/:mode', async (ctx, next) => {
  try {
    ctx.body = await service.getMapMeta({ mode: ctx.params.mode }, getTrophyRangeLower(ctx.request.query), getTrophyRangeHigher(ctx.request.query));
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/meta/mode', async (ctx, next) => {
  try {
    ctx.body = await service.getModeMeta(getTrophyRangeLower(ctx.request.query), getTrophyRangeHigher(ctx.request.query));
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

export default router.routes();
