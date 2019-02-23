import Router from 'koa-router';
import AppService from '../services/AppService';

export default function createRoutes(service: AppService) {
  const router = new Router();

  router.get('/labels', async (ctx, next) => {
    ctx.body = service.getLabels();
    await next();
  });

  router.get('/featured-players', async (ctx, next) => {
    ctx.body = service.getFeaturedPlayers();
    await next();
  });

  router.get('/player/:name', async (ctx, next) => {
    ctx.body = await service.getPlayerStatistics(ctx.params.name);
    ctx.set('Cache-Control', 'public, max-age=300');
    await next();
  });

  return router.routes();
};
