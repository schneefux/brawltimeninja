import Router from 'koa-router';
import AppService from '../services/AppService';

export default function createRoutes(service: AppService) {
  const router = new Router();

  router.get('/shards', async (ctx, next) => {
    ctx.body = service.getShards();
    await next();
  });

  router.get('/name-regex', async (ctx, next) => {
    ctx.body = service.getNameRegex();
    await next();
  });

  router.get('/labels', async (ctx, next) => {
    ctx.body = service.getLabels();
    await next();
  });

  router.get('/featured-players', async (ctx, next) => {
    ctx.body = service.getFeaturedPlayers();
    await next();
  });

  router.get('/player/:shard/:name', async (ctx, next) => {
    const data = await service.getPlayerStatistics(ctx.params.shard, ctx.params.name);
    if (data == null) {
      ctx.throw(404, 'not found');
    } else {
      ctx.body = data;
    }
    ctx.set('Cache-Control', 'public, max-age=300');
    await next();
  });

  return router.routes();
};
