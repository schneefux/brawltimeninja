import { tagWithoutHashType } from '../schema/types.js'
import BrawlstarsService from '../services/BrawlstarsService.js'
import { publicProcedure, router } from '../trpc.js'

const brawlstarsService = new BrawlstarsService()

export const clubRouter = router({
  byTag: publicProcedure
    .input(tagWithoutHashType)
    .query(async ({ input, ctx }) => {
      ctx.res.set('Cache-Control', 'public, max-age=180')
      return await brawlstarsService.getClubStatistics(input)
    })
})
