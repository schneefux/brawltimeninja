import Koa from 'koa';
import cors from '@koa/cors';
import Router from 'koa-router';

import statusRoutes from './routes/status';
import brawlstarsRoutes from './routes/brawlstars';
import blogRoutes from './routes/blog';
import partnerRoutes from './routes/partners';

const app = new Koa();
const router = new Router();
const path = '/api';

router.use(path + '/status', statusRoutes);
router.use(path + '/blog', blogRoutes);
router.use(path + '/partners', partnerRoutes);
router.use(path, brawlstarsRoutes);

app.use(cors({ origin: '*' })); // TODO for development only
app.use(router.routes());

const port = parseInt(process.env.PORT || '') || 3001;

app.listen(port, () => {
  console.log(`listening on port ${port}`)
});
