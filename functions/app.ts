import Koa from 'koa';
import cors from '@koa/cors';
import Router from 'koa-router';
import statusRoutes from './routes/status';
import createService, { Service } from './services/AppServiceFactory';
import createRoutes from './routes/AppRoutesFactory';

export default function createApp(path: string = '/api') {
  const app = new Koa();
  const router = new Router();

  router.use(path + '/status', statusRoutes);
  router.get(path + '/services', async (ctx, next) => {
    ctx.body = Object.keys(Service).map((service) => ({
      label: Service[<keyof typeof Service>service],
      id: service,
    }));
    await next();
  });

  // iterate through enum https://github.com/Microsoft/TypeScript/issues/17198
  Object.keys(Service).forEach((name) => {
    const serviceName = name as keyof typeof Service;

    const service = createService(serviceName);
    const routes = createRoutes(service);
    router.use(path + '/' + serviceName, routes);
  });

  app.use(cors({ origin: '*' })); // TODO for development only
  app.use(router.routes());
  return app;
}
