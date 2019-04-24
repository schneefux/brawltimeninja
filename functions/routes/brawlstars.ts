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
  const data = await service.getPlayerStatistics(ctx.params.name);
  if (data == null) {
    ctx.throw(404, 'not found');
  } else {
    ctx.body = data;
  }
  ctx.set('Cache-Control', 'public, max-age=300');
  await next();
});

router.get('/current-events', async (ctx, next) => {
  ctx.body = await service.getEvents();
  ctx.set('Cache-Control', 'public, max-age=600');
  await next();
});

export default router.routes();
