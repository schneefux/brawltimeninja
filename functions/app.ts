import Koa from 'koa';
import cors from '@koa/cors';
import Router from 'koa-router';
import statusRoutes from './routes/status';
import brawlstarsRoutes from './routes/brawlstars';
import blogRoutes from './routes/blog';

export default function createApp(path: string = '/api') {
  const app = new Koa();
  const router = new Router();

  router.use(path + '/status', statusRoutes);
  router.use(path + '/blog', blogRoutes);
  router.use(path, brawlstarsRoutes);

  app.use(cors({ origin: '*' })); // TODO for development only
  app.use(router.routes());
  return app;
}
