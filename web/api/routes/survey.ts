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
})
