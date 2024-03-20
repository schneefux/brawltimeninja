import { Knex } from 'knex'
import { StatsD } from 'hot-shots'
import { differenceInMinutes, parseISO } from "date-fns"
import FandomService from './FandomService'
import { KlickerService } from '@schneefux/klicker/service'
import MapReport from './MapReport'
import PromptTemplateRenderService from './PromptTemplateRenderService'
import OpenAIService from './OpenAIService'
import { formatClickhouseDate, formatMode, getTodaySeasonEnd } from '~/lib/util'
import { Locale } from '~/locales'

const stats = new StatsD({ prefix: 'brawltime.reports.' })

export interface ActiveEvent {
  mode: string
  map: string
}

export interface Report {
  markdown: string
  timestamp: Date
}

export default class ReportGeneratorService {
  private mapReport: MapReport
  private openaiService: OpenAIService
  private fandomService = new FandomService()
  private promptTemplateRenderService = new PromptTemplateRenderService()

  constructor(openAiApiKey: string, private knex: Knex, private $klicker: KlickerService) {
    this.mapReport = new MapReport($klicker)
    this.openaiService = new OpenAIService(openAiApiKey)
  }

  public async getActiveEvents(): Promise<ActiveEvent[]> {
    const data = await this.$klicker.query({
      cubeId: 'map',
      dimensionsIds: ['mode', 'map'],
      metricsIds: ['timestamp', 'picks'],
      slices: {
        season: [formatClickhouseDate(getTodaySeasonEnd())],
      },
      sortId: 'timestamp',
      limit: 20,
    })

    return data.data
      .filter(e =>
        // last battle is recent
        differenceInMinutes(new Date(), parseISO(e.metricsRaw.timestamp as string)) <= 60
          // sample size is large
          && e.metricsRaw.picks as number > 10000
      )
      .map(e => ({
        mode: e.dimensionsRaw.mode.mode as string,
        map: e.dimensionsRaw.map.map as string,
      }))
  }

  public async getReportForMap(localeIso: string, mode: string, map: string): Promise<Report|undefined> {
    // TODO: distinguish power league events
    const lastReport = await this.knex('map_report')
      .where({
        locale_iso: localeIso,
        mode,
        map,
      })
      .orderBy('timestamp', 'desc')
      .first()

    return lastReport != undefined ? {
      markdown: lastReport.completion,
      timestamp: lastReport.timestamp,
    } : undefined
  }

  public async updateReportsForMap(locale: Locale, event: ActiveEvent): Promise<void> {
    const generateStart = performance.now()

    const reportId = {
      locale_iso: locale.iso,
      mode: event.mode,
      map: event.map,
    }

    // query database for last update date
    const lastUpdate = await this.knex('map_report')
      .where(reportId)
      .orderBy('timestamp', 'desc')
      .first()

    // if last update is recent, skip
    const date12HoursAgo = new Date()
    date12HoursAgo.setHours(date12HoursAgo.getHours() - 12)
    if (lastUpdate != undefined && lastUpdate.timestamp > date12HoursAgo) {
      console.log('skipping', reportId, 'because last update is recent', lastUpdate.timestamp)
      return
    }

    console.log('generating', reportId, 'last update', lastUpdate?.timestamp)

    const fandomModeData = await this.fandomService.cachedGetModeData(formatMode(event.mode))
    const template = await this.mapReport.generateTemplateForMap(locale, event.mode, event.map, fandomModeData)
    if (template == undefined) {
      console.log('skipping', reportId, 'because template is not available')
      return
    }

    const prompt = await this.promptTemplateRenderService.render(template)
    const completion = await this.openaiService.generateCompletion(prompt)

    await this.knex('map_report').insert({
      locale_iso: locale.iso,
      mode: event.mode,
      map: event.map,
      timestamp: new Date(),
      prompt,
      completion,
    })

    stats.timing('generate_report', performance.now() - generateStart)
  }

  // TODO: identify power league map / competition map and explain
}
