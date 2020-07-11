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

router.get('/clicker/top/exp', async (ctx, next) => {
  ctx.body = await service.getTopByExp(100);
  await next();
});

router.get('/clicker/history/:tag', async (ctx, next) => {
  ctx.body = await service.getHistory(ctx.params.tag);
  await next();
});

router.get('/clicker/winrates/:tag', async (ctx, next) => {
  ctx.body = await service.getPlayerWinrates(ctx.params.tag);
  await next();
});

router.get('/clicker/meta/brawler', async (ctx, next) => {
  ctx.body = await service.getBrawlerMeta(ctx.request.query.trophyrangeId);
  await next();
});

router.get('/clicker/meta/starpower', async (ctx, next) => {
  ctx.body = await service.getStarpowerMeta();
  await next();
});

router.get('/clicker/meta/gadget', async (ctx, next) => {
  ctx.body = await service.getGadgetMeta();
  await next();
});

router.get('/clicker/meta/mode', async (ctx, next) => {
  ctx.body = await service.getModeMeta();
  await next();
});

router.get('/clicker/meta/map', async (ctx, next) => {
  ctx.body = await service.getMapMeta();
  await next();
});

export default router.routes();
