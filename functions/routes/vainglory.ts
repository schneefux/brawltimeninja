import Router from 'koa-router';
import VaingloryService from '../services/Vainglory';

const token = process.env.VAINGLORY_TOKEN || '';
if (token == '') throw new Error('Please set $VAINGLORY_TOKEN!');

const router = new Router();
const vainglory = new VaingloryService(token);

router.get('/labels', async (ctx, next) => {
  ctx.body = vainglory.getLabels();
  await next();
});

router.get('/featured-players', async (ctx, next) => {
  ctx.body = vainglory.getFeaturedPlayers();
  await next();
});

router.get('/player/:name', async (ctx, next) => {
  ctx.body = await vainglory.getPlayerStatistics(ctx.params.name);
  ctx.set('Cache-Control', 'public, max-age=300');
  await next();
});

export default router;
