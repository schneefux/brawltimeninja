import z from 'zod'
import { tagWithoutHashType } from '../schema/types'
import BrawlstarsService from '../services/BrawlstarsService'
import { publicProcedure, router } from '../trpc'

const brawlstarsService = new BrawlstarsService()

export const clubRouter = router({
  byTag: publicProcedure
    .input(tagWithoutHashType)
    .query(async ({ input, ctx }) => {
      ctx.res.set('Cache-Control', 'public, max-age=180, stale-while-revalidate=60, stale-if-error=900')
      return await brawlstarsService.getClubStatistics(input)
    }),
  activityStatisticsByTags: publicProcedure
    .input(z.array(tagWithoutHashType))
    .query(async ({ input, ctx }) => {
      ctx.res.set('Cache-Control', 'public, max-age=180, stale-while-revalidate=60, stale-if-error=900')
      return await brawlstarsService.getClubActivityStatistics(input)
    }),
})
