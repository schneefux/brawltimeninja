import Router from 'koa-router';

import BrawlstarsService from '../services/Brawlstars';

const service = new BrawlstarsService();

const router = new Router();

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

router.get('/club/:tag', async (ctx, next) => {
  try {
    ctx.body = await service.getClubStatistics(ctx.params.tag);
    ctx.set('Cache-Control', 'public, max-age=180');
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

router.get('/meta/map/events', async (ctx, next) => {
  try {
    ctx.body = await service.getActiveMapMeta();
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    console.log(error);
    ctx.throw(error.status, error.reason);
  }
  await next();
});

export default router.routes();
