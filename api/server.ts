import Koa from 'koa'
import Router from '@koa/router'
import cors from '@koa/cors'
import isbot from 'isbot'
import StatsD from 'hot-shots'
import BrawlstarsService from './services/Brawlstars.js'

const stats = new StatsD({ prefix: 'brawltime.api.' })
const service = new BrawlstarsService()

const app = new Koa()
app.use(cors({ origin: '*' }))

const router = new Router({
  prefix: '/api',
})

router.get('/status', (ctx) => {
  ctx.body = { 'status': 'ok' }
})

// TODO validate schema via https://www.router.io/docs/latest/Getting-Started/#serialize-your-data
router.get('/player/:tag', async (ctx) => {
  const bot = isbot(ctx.req.headers['user-agent'] || '')
  if (bot) {
    stats.increment('player.bot')
  } else {
    stats.increment('player.human')
  }

  try {
    ctx.body = await service.getPlayerStatistics(ctx.params.tag, !bot);
    ctx.set('Cache-Control', 'public, max-age=180')
  } catch (error: any) {
    console.log(error)
    ctx.throw(error.status, error.reason)
  }
})

router.get('/club/:tag', async (ctx) => {
  try {
    ctx.body = await service.getClubStatistics(ctx.params.tag);
    ctx.set('Cache-Control', 'public, max-age=180')
  } catch (error: any) {
    console.log(error)
    ctx.throw(error.status, error.reason)
  }
})

router.get('/events/active', async (ctx) => {
  try {
    ctx.body = await service.getActiveEvents();
    ctx.set('Cache-Control', 'public, max-age=300')
  } catch (error: any) {
    console.log(error)
    ctx.throw(error.status, error.reason)
  }
})

router.get('/leaderboard/:metric', async (ctx) => {
  try {
    ctx.body = await service.getLeaderboard(ctx.params['metric'])
    ctx.set('Cache-Control', 'public, max-age=600')
  } catch (error: any) {
    console.log(error)
    ctx.throw(error.status, error.reason)
  }
});

const port = parseInt(process.env.PORT || '') || 3001

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
