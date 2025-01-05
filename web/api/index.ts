import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { playerRouter } from './routes/player'
import { clubRouter } from './routes/club'
import { createContext } from './context'
import { rankingsRouter } from './routes/rankings'
import { eventsRouter } from './routes/events'
import { router } from './trpc'
import renderRouter from './routes/render'
import klickerRouter from './routes/klicker'
import etag from 'etag'
import { reportRouter } from './routes/report'
import { authRouter } from './routes/auth'
import { surveyRouter } from './routes/survey'

const appRouter = router({
  auth: authRouter,
  player: playerRouter,
  club: clubRouter,
  rankings: rankingsRouter,
  events: eventsRouter,
  report: reportRouter,
  survey: surveyRouter,
})

export type AppRouter = typeof appRouter

const app = express()

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal'])

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
