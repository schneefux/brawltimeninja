import { createServer, proxy } from 'aws-serverless-express';
import lambda from 'aws-lambda';
import Koa from 'koa';
import cors from '@koa/cors';
import Router from 'koa-router';

import statusRoutes from '../routes/status';
import brawlstarsRoutes from '../routes/brawlstars';
import blogRoutes from '../routes/blog';

const isLambda = require.main !== module;

const app = new Koa();
const router = new Router();
const path = isLambda ? '/.netlify/functions/api' : '/api';

router.use(path + '/status', statusRoutes);
router.use(path + '/blog', blogRoutes);
router.use(path, brawlstarsRoutes);

app.use(router.routes());

const server = createServer(app.callback());

export const handler = (event: any, context: lambda.Context) => {
  proxy(server, event, context);
};

if (!isLambda) {
  // called directly
  const port = parseInt(process.env.PORT || '') || 3001;

  app.use(cors({ origin: '*' })); // TODO for development only
  app.listen(port, 'localhost', () => {
    console.log(`listening on port ${port}`)
  });
}
