import Router from 'koa-router';

import ClickerService from './services/Clicker';
import { Player, BattleLog } from '~/model/Brawlstars';

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

router.get('/clicker/top/:metric/brawler/:brawler', async (ctx, next) => {
  ctx.body = await service.getTopBrawlerByMetric(ctx.params.brawler, ctx.params.metric, parseInt(ctx.query.limit) || 100);
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

export default router.routes();
