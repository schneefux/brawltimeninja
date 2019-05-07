import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import trackRoutes from '../routes/track';

const app = new Koa();

app.use(bodyParser());
app.use(trackRoutes);

const port = parseInt(process.env.PORT || '') || 3002;

app.listen(port, 'localhost', () => {
  console.log(`listening on port ${port}`)
});
