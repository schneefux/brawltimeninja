import Koa from 'koa'
import cors from '@koa/cors'
import { Browser, chromium } from 'playwright'
import StatsD from 'hot-shots'

const maxage = parseInt(process.env.CACHE_SECONDS || '86400')
const WEB_URL = (process.env.WEB_URL || 'https://brawltime.ninja/').replace(/\/$/, '') // remove trailing slash

const stats = new StatsD({ prefix: 'brawltime.shotter.' })
const app = new Koa()

let browser: Browser

app.use(cors({ origin: '*' })); // TODO for development only
app.use(async (ctx, next) => {
  if (!(ctx.req.method == 'GET' && ctx.path == '/status')) {
    await next()
    return
  }

  ctx.body = ({ 'status': 'ok' })
})
app.use(async (ctx, next) => {
  if (ctx.method != 'GET') {
    await next()
    return
  }

  stats.increment('request')
  const path = ctx.path
  if (!path.includes('/embed/') || !/[a-zA-Z0-9\\/]*/.test(path)) {
    ctx.throw(403, 'URL not allowed')
    stats.increment('request.invalid-url')
    return
  }

  const start = process.hrtime()
  const page = await browser.newPage()
  await page.goto(WEB_URL + path)
  await page.waitForTimeout(300) // wait for history graph
  const element = await page.$('.sharepic')
  if (element == null) {
    stats.increment('request.class-not-found')
    ctx.throw(404, 'could not find sharepic class')
    return
  }
  const buffer = await element.screenshot({ type: 'png' })
  await page.close()
  const duration = process.hrtime(start)
  stats.timing('timer', duration[0] * 1000 + duration[1] / 1E6)

  ctx.set('Cache-Control', `public, max-age=${maxage}`)
  ctx.length = buffer.length
  ctx.lastModified = new Date()
  ctx.type = 'image/png'
  ctx.body = buffer
})

const port = parseInt(process.env.PORT || '') || 3005

chromium.launch().then(b => {
  browser = b
  app.listen(port, () => {
    console.log(`listening on port ${port}`)
  })
})
