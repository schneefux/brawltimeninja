import Router from 'koa-router';

const router = new Router();

router.get('/', async (ctx, next) => {
  ctx.body = ({ 'status': 'ok' });
  await next();
});

export default router.routes();
