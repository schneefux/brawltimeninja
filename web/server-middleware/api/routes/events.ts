import { createRouter } from '../context'
import BrawlstarsService from '../services/BrawlstarsService'

const brawlstarsService = new BrawlstarsService()

export const eventsRouter = createRouter()
  .query('active', {
    async resolve({ ctx }) {
      try {
        const events = await brawlstarsService.getActiveEvents()
        ctx.res?.set('Cache-Control', 'public, max-age=300')
        return events
      } catch (err) {
        console.error(err)
        return {
          current: [],
          upcoming: [],
        }
      }
    },
  })
