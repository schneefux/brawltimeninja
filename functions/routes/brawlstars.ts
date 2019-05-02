import Router from 'koa-router';

import BrawlstarsService from '../services/Brawlstars';

const service = new BrawlstarsService(process.env.BRAWLSTARS_TOKEN || '');

const router = new Router();

router.get('/featured-players', async (ctx, next) => {
  ctx.body = service.getFeaturedPlayers();
  ctx.set('Cache-Control', 'public, max-age=3600');
  await next();
});

router.get('/player/:name', async (ctx, next) => {
  try {
    ctx.body = await service.getPlayerStatistics(ctx.params.name);
    ctx.set('Cache-Control', 'public, max-age=300');
  } catch (error) {
    ctx.throw(error.status, error.reason);
  }
  await next();
});

router.get('/current-events', async (ctx, next) => {
  try {
    ctx.body = await service.getEvents();
    ctx.set('Cache-Control', 'public, max-age=600');
  } catch (error) {
    ctx.throw(error.status, error.reason);
  }
  await next();
});

export default router.routes();
