import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';

import trackRoutes from './routes';

const app = new Koa();

app.use(cors({ origin: '*' })); // TODO for development only
app.use(bodyParser());
app.use(trackRoutes);

const port = parseInt(process.env.PORT || '') || 3004;

app.listen(port, () => {
  console.log(`listening on port ${port}`)
});
