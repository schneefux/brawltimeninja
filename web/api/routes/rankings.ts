import z from 'zod'
import { idType } from '../schema/types'
import BrawlstarsService from '../services/BrawlstarsService'
import { publicProcedure, router } from '../trpc'

const brawlstarsService = new BrawlstarsService()

export const rankingsRouter = router({
  clubsByCountry: publicProcedure
    .input(z.object({
      country: z.string(), // TODO use enum?
    }))
    .query(async ({ input, ctx }) => {
      const rankings = await brawlstarsService.getClubRanking(input.country)
      ctx.res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60, stale-if-error=900')
      return rankings
    }),
  playersByCountryAndBrawler: publicProcedure
    .input(z.object({
      country: z.string(),
      brawlerId: idType,
    })) // TODO use enum?
    .query(async ({ input, ctx }) => {
      const rankings = await brawlstarsService.getBrawlerRanking(input.country, input.brawlerId)
      ctx.res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60, stale-if-error=900')
      return rankings
    }),
  playersByCountry: publicProcedure
    .input(z.object({
      country: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      const rankings = await brawlstarsService.getPlayerRanking(input.country)
      ctx.res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60, stale-if-error=900')
      return rankings
    }),
})
