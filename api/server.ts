import Koa from 'koa'
import Router from '@koa/router'
import cors from '@koa/cors'
import isbot from 'isbot'
import StatsD from 'hot-shots'
import BrawlstarsService from './services/Brawlstars.js'
import TrackerService from './services/Tracker.js'

const stats = new StatsD({ prefix: 'brawltime.api.' })
const brawlstarsService = new BrawlstarsService()
const trackerService = new TrackerService()

const app = new Koa()
app.use(cors({ origin: '*' }))

const router = new Router({
  prefix: '/api',
})

router.get('/status', (ctx) => {
  ctx.body = { 'status': 'ok' }
})

router.get('/player/:tag', async (ctx) => {
  const bot = isbot(ctx.req.headers['user-agent'] || '')
  if (bot) {
    stats.increment('player.bot')
  } else {
    stats.increment('player.human')
  }

  try {
    ctx.body = await brawlstarsService.getPlayerStatistics(ctx.params.tag, !bot);
    ctx.set('Cache-Control', 'public, max-age=180')
  } catch (error: any) {
    console.log(error)
    ctx.throw(error.status, error.reason)
  }
})

router.post('/player/:tag/track', async (ctx) => {
  try {
    ctx.body = await trackerService.updatePlayerTrackingStatus(ctx.params.tag);
  } catch (error: any) {
    console.log(error)
    ctx.throw(error.status, error.reason)
  }
})

router.post('/tracker/update', async (ctx) => {
  try {
    ctx.body = await trackerService.updateAll();
  } catch (error: any) {
    console.log(error)
    ctx.throw(error.status, error.reason)
  }
})

router.get('/club/:tag', async (ctx) => {
  try {
    ctx.body = await brawlstarsService.getClubStatistics(ctx.params.tag);
    ctx.set('Cache-Control', 'public, max-age=180')
  } catch (error: any) {
    console.log(error)
    ctx.throw(error.status, error.reason)
  }
})

router.get('/rankings/:country/clubs', async (ctx) => {
  try {
    ctx.body = await brawlstarsService.getClubRanking(ctx.params.country);
    ctx.set('Cache-Control', 'public, max-age=300')
  } catch (error: any) {
    console.log(error)
    ctx.throw(error.status, error.reason)
  }
})

router.get('/rankings/:country/brawlers/:id', async (ctx) => {
  try {
    ctx.body = await brawlstarsService.getBrawlerRanking(ctx.params.country, ctx.params.id);
    ctx.set('Cache-Control', 'public, max-age=300')
  } catch (error: any) {
    console.log(error)
    ctx.throw(error.status, error.reason)
  }
})

router.get('/rankings/:country/players', async (ctx) => {
  try {
    ctx.body = await brawlstarsService.getPlayerRanking(ctx.params.country);
    ctx.set('Cache-Control', 'public, max-age=300')
  } catch (error: any) {
    console.log(error)
    ctx.throw(error.status, error.reason)
  }
})

router.get('/events/active', async (ctx) => {
  try {
    ctx.body = await brawlstarsService.getActiveEvents();
    ctx.set('Cache-Control', 'public, max-age=300')
  } catch (error: any) {
    console.log(error)
    ctx.throw(error.status, error.reason)
  }
})

const port = parseInt(process.env.PORT || '') || 3001

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
