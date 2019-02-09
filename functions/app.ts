import cors from 'cors';
import express from 'express';
import statusRoute from './routes/status';
import brawlstarsRoute from './routes/brawlstars';
//import vaingloryRoute from './routes/vainglory';

function ninjaReroute(prefix: string) {
  return function(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction) {
    req.url = '/' + req.get('Ninja-App') + req.path;
    next();
  }
}

export default function createApp(path: string = '/api'): express.Application {
  const app = express();
  app.use(path + '/status', statusRoute);

  app.options('*', cors());
  app.use(ninjaReroute(path));
  app.use('/brawlstars' + path, brawlstarsRoute);
  //app.use('/vainglory' + path, vaingloryRoute);
  return app;
}
