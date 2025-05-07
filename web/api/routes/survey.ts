import { TRPCError } from '@trpc/server'
import { StatsD } from 'hot-shots'
import { tagWithoutHashType } from '../schema/types'
import Knex from 'knex'
import knexfile from '../knexfile'
import { publicProcedure, router } from '../trpc'
import { z } from 'zod'

const environment = process.env.NODE_ENV || 'development'

let knex: ReturnType<typeof Knex> | undefined

if (process.env.MYSQL_HOST) {
  knex = Knex(knexfile[environment])
} else {
  console.warn('MYSQL_HOST is not set, survey will be unavailable')
}

const stats = new StatsD({ prefix: 'brawltime.survey.' })

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
      if (!knex) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Survey is not available'
        })
      }

      await knex('survey_vote')
        .insert({
          fingerprint: ctx.fingerprint,
          tag: input.tag,
          mode: input.mode,
          best: input.best,
          rest: JSON.stringify(input.rest),
          player_trophies: input.player.trophies,
          player_brawler_trophies: JSON.stringify(input.player.brawlersTrophies),
        })

      stats.increment('vote')
    }),
  getSummary: publicProcedure
    .input(z.object({
      mode: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (!knex) {
        throw new TRPCError({
          code: 'NOT_IMPLEMENTED',
          message: 'Survey is not available'
        })
      }

      // get number of "best" votes by brawler since 2 weeks ago
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

      const query = knex('survey_vote')
        .select('best')
        .count('best as votes')
        .max('timestamp as timestamp')
        .groupBy('best')
        .orderBy('votes', 'desc')
        .where('timestamp', '>=', twoWeeksAgo)

      if (input.mode) {
        query.where('mode', input.mode)
      }

      const data = await query

      const votesSum = data.reduce((acc, vote) => acc + vote.votes, 0)
      const lastUpdate = data.reduce((acc, vote) => (vote.timestamp > acc ? vote.timestamp : acc), new Date(0))
      const votes = data.map((vote) => ({
        brawler: vote.best as string,
        voteRate: parseFloat((vote.votes / votesSum).toFixed(4)),
      }))

      ctx.res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60, stale-if-error=900')
      return {
        sum: votesSum,
        since: twoWeeksAgo,
        lastUpdate,
        votes,
      }
    }),
})
