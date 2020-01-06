import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import trackRoutes from './routes';

const app = new Koa();

app.use(bodyParser());
app.use(trackRoutes);

const port = parseInt(process.env.PORT || '') || 3002;

app.listen(port, () => {
  console.log(`listening on port ${port}`)
});
