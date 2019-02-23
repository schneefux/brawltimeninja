import Router from 'koa-router';
import ApexlegendsService from '../services/Apexlegends';

const router = new Router();
const apexlegends = new ApexlegendsService();

router.get('/labels', async (ctx, next) => {
  ctx.body = apexlegends.getLabels();
  await next();
});

router.get('/featured-players', async (ctx, next) => {
  ctx.body = apexlegends.getFeaturedPlayers();
  await next();
});

router.get('/player/:name', async (ctx, next) => {
  ctx.body = await apexlegends.getPlayerStatistics(ctx.params.name);
  ctx.set('Cache-Control', 'public, max-age=300');
  await next();
});

export default router;
