import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { playerRouter, updateAllProfiles } from './routes/player'
import { clubRouter } from './routes/club'
import { createContext } from './context'
import { rankingsRouter } from './routes/rankings'
import { eventsRouter } from './routes/events'
import { router } from './trpc'

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

app.use(
  '/',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
)

export default app
