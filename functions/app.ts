import Koa from 'koa';
import cors from '@koa/cors';
import Router from 'koa-router';
import compress from 'koa-compress';
import Cache from 'koa-file-cache';
import statusRouter from './routes/status';
import brawlstarsRouter from './routes/brawlstars';
import vaingloryRouter from './routes/vainglory';

const cacheSeconds = parseInt(process.env.CACHE_SECONDS || '600');
const cachePath = process.env.CACHE_PATH || 'cache';
const cacheEnable = process.env.CACHE_DISABLE == undefined;

export default function createApp(path: string = '/api') {
  const app = new Koa();
  const router = new Router();

  router.use('/status', statusRouter.routes());
  router.use('/brawlstars' + path, brawlstarsRouter.routes());
  router.use('/vainglory' + path, vaingloryRouter.routes());

  app.use(cors());
  if (cacheEnable) {
    app.use(Cache({ folder: cachePath, cacheTime: cacheSeconds*1000 }));
  }
  app.use(compress());
  app.use(router.routes());
  return app;
}
