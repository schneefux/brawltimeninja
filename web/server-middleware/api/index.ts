import { ServerMiddleware } from '@nuxt/types'
import express from 'express'
import * as trpcExpress from '@trpc/server/adapters/express'
import superjson from 'superjson'
import { playerRouter } from './routes/player'
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

app.use(
  '/',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
)

const middleware: ServerMiddleware = app
export default middleware
