import { TRPCError } from '@trpc/server'
import { StatsD } from 'hot-shots'
import { tagWithoutHashType } from '../schema/types'
import BrawlstarsService from '../services/BrawlstarsService'
import ProfileUpdaterService from '../services/ProfileUpdaterService'
import Knex from 'knex'
import knexfile from '../knexfile'
import { publicProcedure, router } from '../trpc'

const environment = process.env.NODE_ENV || 'development'
let profileUpdaterService: ProfileUpdaterService | undefined

if (process.env.MYSQL_HOST) {
  const knex = Knex(knexfile[environment])
  profileUpdaterService = new ProfileUpdaterService(async (tag) => {
    const player = await brawlstarsService.getPlayerStatistics(tag, true)
    if (player.battles.length == 0) {
      return undefined
    }
    return player.battles[0].timestamp
  }, knex)
} else {
  console.warn('MYSQL_HOST is not set, profile tracking will be unavailable')
}

const brawlstarsService = new BrawlstarsService()

export async function updateAllProfiles() {
  if (profileUpdaterService) {
    return await profileUpdaterService.updateAll()
  }
}

const stats = new StatsD({ prefix: 'brawltime.api.' })

export const playerRouter = router({
  byTag: publicProcedure
    .input(tagWithoutHashType)
    .query(async ({ input, ctx }) => {
      if (ctx.isBot) {
        stats.increment('player.bot')
      } else {
        stats.increment('player.human')
      }

      const player = await brawlstarsService.getPlayerStatistics(input, !ctx.isBot)
      if (profileUpdaterService && !ctx.isBot && player.battles.length > 0) {
        // organic pageview: update confirmation status
        try {
          await profileUpdaterService.updateProfileTrackingStatus(input, player.battles[0].timestamp)
        } catch (err) {
          console.error('Error updating profile tracking status', err)
        }
      }
      ctx.res.set('Cache-Control', 'public, max-age=180')
      return player
    }),
  getTrackingStatus: publicProcedure
    .input(tagWithoutHashType)
    .query(async ({ input }) => {
      return await profileUpdaterService?.getProfileTrackingStatus(input)
    }),
  trackTag: publicProcedure
    .input(tagWithoutHashType)
    .mutation(async ({ input }) => {
      const stats = await brawlstarsService.getPlayerStatistics(input, true)
      if (stats.battles.length == 0) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Player did not play any battles recently'
        })
      }
      return await profileUpdaterService?.upsertProfileTrackingStatus(input, stats.battles[0].timestamp)
    }),
})
