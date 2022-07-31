import { ServerMiddleware } from '@nuxt/types'
import express from 'express'
import * as trpcExpress from '@trpc/server/adapters/express'
import superjson from 'superjson'
import { playerRouter, updateAllProfiles } from './routes/player'
import { clubRouter } from './routes/club'
import { createContext, createRouter } from './context'
import { rankingsRouter } from './routes/rankings'
import { eventsRouter } from './routes/events'

const appRouter = createRouter()
  .transformer(superjson)
  .merge('player.', playerRouter)
  .merge('club.', clubRouter)
  .merge('rankings.', rankingsRouter)
  .merge('events.', eventsRouter)
  .formatError(({ shape, error }) => {
    // TODO log to sentry
    return shape
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

app.use(
  '/',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
)

const middleware: ServerMiddleware = app
export default middleware
