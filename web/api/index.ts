import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { playerRouter, updateAllProfiles } from './routes/player'
import { clubRouter } from './routes/club'
import { createContext } from './context'
import { rankingsRouter } from './routes/rankings'
import { eventsRouter } from './routes/events'
import { router } from './trpc'
import renderRouter from './routes/render'
import klickerRouter from './routes/klicker'
import etag from 'etag'
import { reportRouter, updateAllReports, updateReport } from './routes/report'

const appRouter = router({
  player: playerRouter,
  club: clubRouter,
  rankings: rankingsRouter,
  events: eventsRouter,
  report: reportRouter,
})

export type AppRouter = typeof appRouter

const app = express()

// TODO restrict to localhost
app.post('/cron', async (req, res, next) => {
  console.time('running cron jobs')
  try {
    const summary = await updateAllProfiles()
    res.json(summary)
  } catch (err) {
    console.error(err)
    next(err)
  }
  console.timeEnd('running cron jobs')
})

// TODO move to cron
app.post('/update-reports', async (req, res, next) => {
  console.time('reports update')
  try {
    const summary = await updateAllReports()
    res.json(summary)
  } catch (err) {
    console.error(err)
    next(err)
  }
  console.timeEnd('reports update')
})

// TODO remove, only for testing
app.post('/update-report', express.json(), async (req, res, next) => {
  console.time('report update')
  try {
    const { locale, mode, map } = req.body
    const summary = await updateReport(locale as string, mode as string, map as string)
    res.json(summary)
  } catch (err) {
    console.error(err)
    next(err)
  }
  console.timeEnd('report update')
})

app.use('/render', renderRouter)
app.use('/klicker', klickerRouter)

app.use(
  '/',
  createExpressMiddleware({
    router: appRouter,
    createContext,
    batching: {
      enabled: false, // improve caching
    },
    responseMeta({ data, ctx, paths, type, errors }) {
      const allPublic =
        paths && paths.every((path) => !path.startsWith('user.'));
      const allOk = errors.length == 0;
      const isQuery = type == 'query';

      if (ctx?.res && allPublic && allOk && isQuery) {
        return {
          headers: {
            etag: etag(JSON.stringify(data)),
            'cache-control': ctx.res.getHeader('cache-control') as string ?? 'public, max-age=0, stale-if-error=86400',
          },
        };
      }
      return {};
    },
  })
)

export default app
