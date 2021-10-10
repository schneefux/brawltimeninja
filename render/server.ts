import Koa from 'koa'
import cors from '@koa/cors'
import { BrowserContext, chromium } from 'playwright'
import StatsD from 'hot-shots'

const maxage = parseInt(process.env.CACHE_SECONDS || '86400') // 24h
const WEB_URL = (process.env.WEB_URL || 'https://brawltime.ninja/').replace(/\/$/, '') // remove trailing slash

const stats = new StatsD({ prefix: 'brawltime.render.' })
const app = new Koa()

let context: BrowserContext

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
  const page = await context.newPage()

  try {
    await page.goto(WEB_URL + path)
    await page.waitForTimeout(300) // wait for history graph
    const element = await page.$('.sharepic')
    if (element == null) {
      stats.increment('request.class-not-found')
      ctx.throw(404, 'could not find sharepic class')
      return
    }
    const buffer = await element.screenshot({ type: 'png' })

    ctx.set('Cache-Control', `public, max-age=${maxage}`)
    ctx.length = buffer.length
    ctx.lastModified = new Date()
    ctx.type = 'image/png'
    ctx.body = buffer
  } finally {
    await page.close()
  }

  const duration = process.hrtime(start)
  stats.timing('timer', duration[0] * 1000 + duration[1] / 1E6)
})

const port = parseInt(process.env.PORT || '') || 3005

chromium.launch({
  args: ['--disable-dev-shm-usage'],
}).then(browser =>
  browser.newContext({
    deviceScaleFactor: 2,
    viewport: {
      height: 2*628,
      width: 2*1200,
    },
    // trigger backend is-bot to prevent POST to clicker
    userAgent: 'brawltime.ninja render bot',
  })
).then(c => {
  context = c
  app.listen(port, () => {
    console.log(`listening on port ${port}`)
  })
})
