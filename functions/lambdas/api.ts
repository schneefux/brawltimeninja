import { createServer, proxy } from 'aws-serverless-express';
import lambda from 'aws-lambda';
import Koa from 'koa';
import Router from 'koa-router';

import statusRoutes from '../routes/status';
import brawlstarsRoutes from '../routes/brawlstars';
import blogRoutes from '../routes/blog';

const app = new Koa();
const router = new Router();
const path = '/.netlify/functions/api';

router.use(path + '/status', statusRoutes);
router.use(path + '/blog', blogRoutes);
router.use(path, brawlstarsRoutes);

app.use(router.routes());

const server = createServer(app.callback());

export const handler = (event: any, context: lambda.Context) => {
  proxy(server, event, context);
};
