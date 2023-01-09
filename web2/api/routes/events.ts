import BrawlstarsService from '../services/BrawlstarsService'
import { publicProcedure, router } from '../trpc'

const brawlstarsService = new BrawlstarsService()

export const eventsRouter = router({
  active: publicProcedure
    .query(async ({ ctx }) => {
      const events = await brawlstarsService.getActiveEvents()
      ctx.res.set('Cache-Control', 'public, max-age=300')
      return events
    }),
})
