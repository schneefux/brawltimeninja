import Knex from 'knex'
import MarkdownIt from 'markdown-it'
import knexfile from '../knexfile'
import { fetch, Agent } from 'undici'
import ReportGeneratorService from '../services/ReportGeneratorService'
import { BrawltimeKlickerService } from '~/plugins/klicker.service'
import { publicProcedure, router } from '../trpc'
import * as z from 'zod'
import { TRPCError } from '@trpc/server'
import { locales } from '~/locales'
import AuthService from '../services/AuthService'

let reportGeneratorService: ReportGeneratorService | undefined
const authService = new AuthService();

const CUBE_URL = process.env.CUBE_URL
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (process.env.MYSQL_HOST && CUBE_URL != undefined && OPENAI_API_KEY != undefined) {
  const environment = process.env.NODE_ENV || 'development'
  const knex = Knex(knexfile[environment])

  const agent = new Agent({
    bodyTimeout: 30000,
    headersTimeout: 30000,
  })

  const klickerService = new BrawltimeKlickerService(
    CUBE_URL,
    () => authService.getToken(),
    (url, input) => fetch(url as string, {
      ...input as any,
      dispatcher: agent,
    }) as any
  )

  reportGeneratorService = new ReportGeneratorService(OPENAI_API_KEY, knex, klickerService)
} else {
  if (CUBE_URL == undefined) {
    console.warn('CUBE_URL is not set, report generator will be unavailable')
  }
  if (OPENAI_API_KEY == undefined) {
    console.warn('OPENAI_API_KEY is not set, report generator will be unavailable')
  }
  if (process.env.MYSQL_HOST == undefined) {
    console.warn('MYSQL_HOST is not set, report generator will be unavailable')
  }
}

export async function updateAllReports() {
  if (reportGeneratorService == undefined) {
    console.warn('Report generator is not available')
    return { error: 'Report generator is not available' }
  }

  const activeEvents = await reportGeneratorService.getActiveEvents()
  console.log('Updating reports for active events')

  for (const activeEvent of activeEvents) {
    // TODO non-latin languages need more output tokens, exceeding the 4k output limit - chunk the prompt for them
    const latinLocales = ['de', 'en', 'it', 'pl', 'es'] // top 5 locales for the test phase
    for (const locale of locales.filter(l => latinLocales.includes(l.iso))) {
      await reportGeneratorService.updateReportsForMap(locale, activeEvent)
      console.log('Updated report for', locale.iso, activeEvent)
    }
  }

  return { events: activeEvents.length }
}

export async function updateReport(localeIso: string, mode: string, map: string) {
  if (reportGeneratorService == undefined) {
    console.warn('Report generator is not available')
    return { error: 'Report generator is not available' }
  }

  const locale = locales.find(l => l.iso == localeIso)

  if (locale == undefined) {
    return { error: 'Unknown locale' }
  }

  console.log('Updating reports for', { localeIso, mode, map })

  await reportGeneratorService.updateReportsForMap(locale, { mode, map })
  console.log('Updated report for', { localeIso, mode, map })

  return { events: 1 }
}

export const reportRouter = router({
  byModeMap: publicProcedure
    .input(z.object({
      mode: z.string(),
      map: z.string(),
      localeIso: z.string(),
    }))
    .query(async ({ input, ctx }) => {
      if (reportGeneratorService == undefined) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Report generator is not available'
        })
      }

      const report = await reportGeneratorService.getReportForMap(input.localeIso, input.mode, input.map)

      if (report == undefined) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No report available'
        })
      }

      const reportHtml = new MarkdownIt().render(report.markdown)

      // cache for 1 hour
      ctx.res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=60, stale-if-error=900')
      return {
        html: reportHtml,
        timestamp: report.timestamp,
      }
    }),
})
