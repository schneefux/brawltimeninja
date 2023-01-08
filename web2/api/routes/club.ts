import { createRouter } from '../context'
import { tagWithoutHashType } from '../schema/types'
import BrawlstarsService from '../services/BrawlstarsService'

const brawlstarsService = new BrawlstarsService()

export const clubRouter = createRouter()
  .query('byTag', {
    input: tagWithoutHashType,
    async resolve({ input, ctx }) {
      ctx.res?.set('Cache-Control', 'public, max-age=180')
      return await brawlstarsService.getClubStatistics(input)
    },
  })
