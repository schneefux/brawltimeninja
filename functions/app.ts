import Koa from 'koa';
import cors from '@koa/cors';
import Router from 'koa-router';
import compress from 'koa-compress';
import statusRouter from './routes/status';
import brawlstarsRouter from './routes/brawlstars';
import vaingloryRouter from './routes/vainglory';

export default function createApp(path: string = '/api') {
  const app = new Koa();
  const router = new Router();

  router.use('/status', statusRouter.routes());
  router.use('/brawlstars' + path, brawlstarsRouter.routes());
  router.use('/vainglory' + path, vaingloryRouter.routes());

  app.use(cors());
  app.use(compress());
  app.use(router.routes());
  return app;
}
