import * as express from 'express';
import statusRoute from './routes/status';
import brawlstarsRoute from './routes/brawlstars';

function createApp(path: string = '/api'): express.Application {
  const app = express();
  app.use(path + '/status', statusRoute);
  app.use(path + '/brawlstars', brawlstarsRoute);
  return app;
}

export default createApp;
