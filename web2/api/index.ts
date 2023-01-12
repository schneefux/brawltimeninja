import express from 'express'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import { playerRouter, updateAllProfiles } from './routes/player.js'
import { clubRouter } from './routes/club.js'
import { createContext } from './context.js'
import { rankingsRouter } from './routes/rankings.js'
import { eventsRouter } from './routes/events.js'
import { router } from './trpc.js'

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
