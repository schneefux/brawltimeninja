import Router from 'koa-router';

import BrawlstarsService from '../services/Brawlstars';

const service = new BrawlstarsService();

const router = new Router();

router.get('/featured-players', async (ctx, next) => {
  ctx.body = service.getFeaturedPlayers();
  ctx.set('Cache-Control', 'public, max-age=3600');
  await next();
});

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

router.get('/current-events', async (ctx, next) => {
  try {
    ctx.body = await service.getEvents();
    ctx.set('Cache-Control', 'public, max-age=300');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/upcoming-events', async (ctx, next) => {
  try {
    ctx.body = await service.getUpcomingEvents();
    ctx.set('Cache-Control', 'public, max-age=300');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/leaderboard/hours', async (ctx, next) => {
  try {
    ctx.body = await service.getHoursLeaderboard();
    ctx.set('Cache-Control', 'public, max-age=6000');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/leaderboard/trophies', async (ctx, next) => {
  try {
    ctx.body = await service.getTrophiesLeaderboard();
    ctx.set('Cache-Control', 'public, max-age=6000');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/meta/brawler', async (ctx, next) => {
  try {
    ctx.body = await service.getBrawlerMeta(ctx.request.query.trophyrangeId);
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/meta/starpower', async (ctx, next) => {
  try {
    ctx.body = await service.getStarpowerMeta();
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/meta/gadget', async (ctx, next) => {
  try {
    ctx.body = await service.getGadgetMeta();
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/meta/map', async (ctx, next) => {
  try {
    ctx.body = await service.getMapMeta(ctx.request.query);
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/meta/mode', async (ctx, next) => {
  try {
    ctx.body = await service.getModeMeta();
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

export default router.routes();
