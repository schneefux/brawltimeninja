import { StatsD } from 'hot-shots'
import { createRouter } from '../context'
import { tagWithoutHashType } from '../schema/types'
import BrawlstarsService from '../services/BrawlstarsService'
import TrackerService from '../services/ProfileUpdateService'

const brawlstarsService = new BrawlstarsService()
const trackerService = new TrackerService()

const stats = new StatsD({ prefix: 'brawltime.api.' })

export const playerRouter = createRouter()
  .query('byTag', {
    input: tagWithoutHashType,
    async resolve({ input, ctx }) {
      if (ctx.isBot) {
        stats.increment('player.bot')
      } else {
        stats.increment('player.human')
      }

      ctx.res?.set('Cache-Control', 'public, max-age=180')

      return await brawlstarsService.getPlayerStatistics(input, !ctx.isBot)
    },
  })
  .mutation('trackTag', {
    input: tagWithoutHashType,
    async resolve({ input }) {
      return await trackerService.updatePlayerTrackingStatus(input);
    },
  })

  /*
router.post('/tracker/update', async (ctx) => {
  try {
    ctx.body = await trackerService.updateAll();
  } catch (error: any) {
    console.log(error)
    ctx.throw(error.status, error.reason)
  }
})
*/
