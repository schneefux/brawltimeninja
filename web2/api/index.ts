import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { playerRouter, updateAllProfiles } from './routes/player.js'
import { clubRouter } from './routes/club.js'
import { createContext } from './context.js'
import { rankingsRouter } from './routes/rankings.js'
import { eventsRouter } from './routes/events.js'
import { router } from './trpc.js'
import renderRouter from './routes/render.js'
//import klickerRouter from './routes/klicker.js'
import etag from 'etag'

const appRouter = router({
  player: playerRouter,
  club: clubRouter,
  rankings: rankingsRouter,
  events: eventsRouter,
})

export type AppRouter = typeof appRouter

const app = express()

// TODO restrict to localhost
app.post('/cron', async (req, res) => {
  console.time('running cron jobs')
  const profileUpdater = await updateAllProfiles()
  console.timeEnd('running cron jobs')

  res.json({ profileUpdater })
})

app.use('/render', renderRouter)
//app.use('/klicker', klickerRouter)

app.use(
  '/',
  createExpressMiddleware({
    router: appRouter,
    createContext,
    responseMeta({ data, ctx, paths, type, errors }) {
      const allPublic =
        paths && paths.every((path) => !path.startsWith('user.'));
      const allOk = errors.length == 0;
      const isQuery = type == 'query';

      if (ctx?.res && allPublic && allOk && isQuery) {
        return {
          headers: {
            etag: etag(JSON.stringify(data)),
            'cache-control': ctx.res.getHeader('cache-control') ?? 'public, max-age=0, stale-if-error=86400',
          },
        };
      }
      return {};
    },
  })
)

export default app
