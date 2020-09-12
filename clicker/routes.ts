import Router from 'koa-router';

import ClickerService from './services/Clicker';
import { Player, BattleLog } from '~/model/Brawlstars';
import { Order } from './services/Cube';

const service = new ClickerService();

const router = new Router();

router.get('/clicker/status', async (ctx, next) => {
  ctx.body = ({ 'status': 'ok' });
  await next();
});

router.post('/clicker/track', async (ctx, next) => {
  await service.store(<{ player: Player, battleLog: BattleLog }> ((<any> ctx.request).body));
  ctx.body = {};
  await next();
});

router.get('/clicker/top/:metric', async (ctx, next) => {
  ctx.body = await service.getTopByMetric(ctx.params.metric, parseInt(ctx.query.limit) || 100);
  ctx.set('Cache-Control', 'public, max-age=60');
  await next();
});

router.get('/clicker/top/:metric/brawler/:brawlerId', async (ctx, next) => {
  ctx.body = await service.getTopBrawlerByMetric(ctx.params.brawlerId, ctx.params.metric, parseInt(ctx.query.limit) || 100);
  ctx.set('Cache-Control', 'public, max-age=60');
  await next();
});

router.get('/clicker/history/:tag', async (ctx, next) => {
  ctx.body = await service.getHistory(ctx.params.tag);
  ctx.set('Cache-Control', 'public, max-age=60');
  await next();
});

router.get('/clicker/winrates/:tag', async (ctx, next) => {
  ctx.body = await service.getPlayerWinrates(ctx.params.tag);
  ctx.set('Cache-Control', 'public, max-age=60');
  await next();
});

router.get('/clicker/meta/brawler', async (ctx, next) => {
  ctx.body = await service.getBrawlerMeta(ctx.request.query.trophyrangeLower || '0', ctx.request.query.trophyrangeHigher || '9999');
  ctx.set('Cache-Control', 'public, max-age=60');
  await next();
});

router.get('/clicker/brawler/:name', async (ctx, next) => {
  ctx.body = await service.getBrawlerStatistics(ctx.params.name);
  ctx.set('Cache-Control', 'public, max-age=60');
  await next();
});

router.get('/clicker/meta/starpower', async (ctx, next) => {
  ctx.body = await service.getStarpowerMeta(ctx.request.query.trophyrangeLower || '0', ctx.request.query.trophyrangeHigher || '9999');
  ctx.set('Cache-Control', 'public, max-age=60');
  await next();
});

router.get('/clicker/meta/gadget', async (ctx, next) => {
  ctx.body = await service.getGadgetMeta(ctx.request.query.trophyrangeLower || '0', ctx.request.query.trophyrangeHigher || '9999');
  ctx.set('Cache-Control', 'public, max-age=60');
  await next();
});

router.get('/clicker/meta/mode', async (ctx, next) => {
  ctx.body = await service.getModeMeta(ctx.request.query.trophyrangeLower || '0', ctx.request.query.trophyrangeHigher || '9999');
  ctx.set('Cache-Control', 'public, max-age=60');
  await next();
});

router.get('/clicker/meta/map', async (ctx, next) => {
  ctx.body = await service.getMapMeta(ctx.request.query.trophyrangeLower || '0', ctx.request.query.trophyrangeHigher || '9999');
  ctx.set('Cache-Control', 'public, max-age=60');
  await next();
});

router.get('/clicker/cube/:cube/:dimensions', async (ctx, next) => {
  const split = (n: string) => n.split(',').filter(p => p.length > 0)

  const cubeName = ctx.params.cube
  const dimensions = split(ctx.params.dimensions)
  const query = (ctx.query || {}) as { [name: string]: string }
  const measures = split(query['select'] || '*')
  const slices = Object.entries(query)
    .filter(([name, value]) => name.startsWith('filter[') && name.endsWith(']'))
    .reduce((slices, [name, value]) => ({ ...slices, [name.slice(7, -1)]: value.split(',') }), {} as { [name: string]: string[] })
  const order = split(query['sort'] || '')
    .filter((name) => name.length > 0)
    .reduce((order, name) => ({
      ...order,
      ...((name.startsWith('-') ? ({ [name.slice(1)]: 'desc' }) : ({ [name]: 'asc' })) as { [name: string]: Order }),
    }), {} as { [name: string]: Order })
  const limit = parseInt(query['limit']) || 1000

  try {
    ctx.body = await service.queryCube(cubeName, measures, dimensions, slices, order, limit)
  } catch (error) {
    console.error('error executing query', error)
    if (error instanceof Error) {
      ctx.body = { message: error.message }
    } else {
      ctx.body = error
    }

    ctx.status = 400
  }

  ctx.set('Cache-Control', 'public, max-age=60')
  await next()
});

export default router.routes();
