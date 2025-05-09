import { TRPCError } from '@trpc/server'
import { StatsD } from 'hot-shots'
import { tagWithoutHashType } from '../schema/types'
import { publicProcedure, router } from '../trpc'
import { z } from 'zod'
import ClickerService from '../services/ClickerService'
import { SurveyVote } from '../../model/SurveyVote'

const stats = new StatsD({ prefix: 'brawltime.survey.' })

const clickhouseUrl = process.env.CLICKHOUSE_URL
let clickerService: ClickerService | undefined
if (clickhouseUrl) {
  clickerService = new ClickerService(clickhouseUrl);
}

export const surveyRouter = router({
  vote: publicProcedure
    .input(z.object({
      tag: tagWithoutHashType,
      mode: z.string(),
      best: z.string(),
      rest: z.array(z.string()),
      player: z.object({
        trophies: z.number(),
        brawlersTrophies: z.array(z.object({
          name: z.string(),
          power: z.number(),
          trophies: z.number(),
        }))
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!clickerService) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Survey is not available'
        })
      }

      const vote: SurveyVote = {
        fingerprint: ctx.fingerprint,
        tag: input.tag,
        mode: input.mode,
        best: input.best,
        rest: input.rest,
        player_trophies: input.player.trophies,
        player_brawler_trophies: input.player.brawlersTrophies,
      }

      await clickerService.storeVote(vote)
      stats.increment('vote')
    }),
  getSummary: publicProcedure
    .input(z.object({
      mode: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (!clickerService) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Survey is not available'
        })
      }

      // get number of "best" votes by brawler
      const data = await clickerService.queryVoteSummary(input.mode)

      const votesSum = data.reduce((acc, vote) => acc + vote.votes, 0)
      const lastUpdate = data.reduce((acc, vote) => (vote.max_timestamp > acc ? vote.max_timestamp : acc), new Date(0))
      const firstUpdate = data.reduce((acc, vote) => (vote.min_timestamp < acc ? vote.min_timestamp : acc), new Date())
      const votes = data.map((vote) => ({
        brawler: vote.best as string,
        voteRate: parseFloat((vote.votes / votesSum).toFixed(4)),
      }))

      ctx.res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60, stale-if-error=900')
      return {
        sum: votesSum,
        since: firstUpdate,
        lastUpdate,
        votes,
      }
    }),
})
