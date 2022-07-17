import * as trpc from '@trpc/server'
import { StatsD } from 'hot-shots'
import { createRouter } from '../context'
import { RequestError } from '../lib/request'
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


      try {
        const stats = await brawlstarsService.getPlayerStatistics(input, !ctx.isBot)
        ctx.res?.set('Cache-Control', 'public, max-age=180')
        return stats
      } catch (err: any) {
        if (err instanceof RequestError) {
          if (err.response.status >= 500) {
            console.error(err, err.response)

            throw new trpc.TRPCError({
              code: 'PRECONDITION_FAILED',
              message: err.response.reason,
              cause: err,
            })
          }

          if (err.response.status == 404) {
            throw new trpc.TRPCError({
              code: 'NOT_FOUND',
              message: err.response.reason,
              cause: err,
            })
          }

          if (err.response.status == 429) {
            throw new trpc.TRPCError({
              code: 'TIMEOUT', // TODO tRPC does not support 429
              message: err.response.reason,
              cause: err,
            })
          }

          console.error(err, err.response)

          throw new trpc.TRPCError({
            code: 'BAD_REQUEST',
            message: err.response.reason,
            cause: err,
          })
        } else {
          console.error(err)
          throw err
        }
      }
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
