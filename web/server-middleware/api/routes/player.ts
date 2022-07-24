import * as trpc from '@trpc/server'
import { StatsD } from 'hot-shots'
import { createRouter } from '../context'
import { RequestError } from '../lib/request'
import { tagWithoutHashType } from '../schema/types'
import BrawlstarsService from '../services/BrawlstarsService'
import ProfileUpdaterService from '../services/ProfileUpdaterService'
import Knex from 'knex'
import knexfile from '../knexfile'

const environment = process.env.NODE_ENV || 'development'
const knex = Knex(knexfile[environment])

const brawlstarsService = new BrawlstarsService()
const profileUpdaterService = new ProfileUpdaterService(async (tag) => {
  const player = await updatePlayer(tag, true)
  return player.battles.length > 0 ? player.battles[0].timestamp : undefined
}, knex)

async function updatePlayer(tag: string, store: boolean) {
  const trackingStatus = await profileUpdaterService.getProfileTrackingStatus(tag)
  return await brawlstarsService.getPlayerStatistics(tag, store, trackingStatus)
}

export async function updateAllProfiles() {
  return await profileUpdaterService.updateAll()
}

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
        const stats = await updatePlayer(input, !ctx.isBot)
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
      return await profileUpdaterService.updateProfileTrackingStatus(input)
    },
  })
