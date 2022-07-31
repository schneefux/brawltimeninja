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
  const player = await brawlstarsService.getPlayerStatistics(tag, true)
  if (player.battles.length == 0) {
    return undefined
  }
  return player.battles[0].timestamp
}, knex)

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
        const stats = await brawlstarsService.getPlayerStatistics(input, !ctx.isBot)
        if (!ctx.isBot && stats.battles.length > 0) {
          // organic pageview: update confirmation status
          try {
            await profileUpdaterService.updateProfileTrackingStatus(input, stats.battles[0].timestamp)
          } catch (err) {
            console.error('Error updating profile tracking status', err)
          }
        }
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
  .query('getTrackingStatus', {
    input: tagWithoutHashType,
    async resolve({ input }) {
      try {
        return await profileUpdaterService.getProfileTrackingStatus(input)
      } catch (err: any) {
        console.error(err)
        throw err
      }
    },
  })
  .mutation('trackTag', {
    input: tagWithoutHashType,
    async resolve({ input }) {
      const stats = await brawlstarsService.getPlayerStatistics(input, true)
      if (stats.battles.length == 0) {
        throw new trpc.TRPCError({
          code: 'NOT_FOUND',
          message: 'Player did not play any battles recently'
        })
      }
      return await profileUpdaterService.upsertProfileTrackingStatus(input, stats.battles[0].timestamp)
    },
  })
