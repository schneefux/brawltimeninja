import Router from 'koa-router';

import DatabaseService from '../services/Database';
import { Player } from '../model/Brawlstars';

const service = new DatabaseService();

const router = new Router();

router.get('/tracker/status', async (ctx, next) => {
  ctx.body = ({ 'status': 'ok' });
  await next();
});

router.post('/tracker/track', async (ctx, next) => {
  await service.storeBrawlstarsRecord(<Player> ((<any> ctx.request).body));
  ctx.body = {};
  await next();
});

router.get('/tracker/top/exp', async (ctx, next) => {
  ctx.body = await service.getTopByExp(50);
  await next();
});

export default router.routes();
