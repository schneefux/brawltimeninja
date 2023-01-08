import * as trpc from '@trpc/server'
import { StatsD } from 'hot-shots'
import { createRouter } from '../context'
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

      const player = await brawlstarsService.getPlayerStatistics(input, !ctx.isBot)
      if (!ctx.isBot && player.battles.length > 0) {
        // organic pageview: update confirmation status
        try {
          await profileUpdaterService.updateProfileTrackingStatus(input, player.battles[0].timestamp)
        } catch (err) {
          console.error('Error updating profile tracking status', err)
        }
      }
      ctx.res?.set('Cache-Control', 'public, max-age=180')
      return player
    },
  })
  .query('getTrackingStatus', {
    input: tagWithoutHashType,
    async resolve({ input }) {
      return await profileUpdaterService.getProfileTrackingStatus(input)
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
