import Router from 'koa-router';
import BrawlstarsService from '../services/Brawlstars';

const token = process.env.BRAWLSTARS_TOKEN || '';
if (token == '') throw new Error('Please set $BRAWLSTARS_TOKEN!');

const router = new Router();
const brawlstars = new BrawlstarsService(token);

router.get('/labels', async (ctx, next) => {
  ctx.body = brawlstars.getLabels();
  await next();
});

router.get('/featured-players', async (ctx, next) => {
  ctx.body = brawlstars.getFeaturedPlayers();
  await next();
});

router.get('/player/:name', async (ctx, next) => {
  ctx.body = await brawlstars.getPlayerStatistics(ctx.params.name);
  ctx.set('Cache-Control', 'public, max-age=300');
  await next();
});

export default router;
