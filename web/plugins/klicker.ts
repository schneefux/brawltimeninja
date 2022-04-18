import Vue from 'vue'
import config from '~/lib/klicker.conf'
import { Context } from "@nuxt/types"
import { Config, SlicerSpec, SliceValue, StaticWidgetSpec, ValueType, VisualisationSpec, DimensionRendererSpec, MetricRendererSpec } from "@schneefux/klicker/types"
import { differenceInMinutes, parseISO, subWeeks, format as formatDate } from "date-fns"
import { CurrentAndUpcomingEvents } from "~/model/Api"
import { formatClickhouseDate, formatMode, getMonthSeasonEnd, getSeasonEnd, getTodaySeasonEnd, idToTag } from "~/lib/util"
import Klicker from '@schneefux/klicker/service'
import { CQuery } from '@schneefux/klicker/components'
import visualisations from '~/lib/klicker.visualisations.conf'
import slicers from '~/lib/klicker.slicers.conf'
import staticWidgets from '~/lib/klicker.widgets.conf'
import { defineNuxtPlugin } from '@nuxtjs/composition-api'
import { BShimmer, BButton, BCard, BSelect, BLightbox, BCheckbox, BRadio, BPage, BPageSection, BScrollingDashboard } from '@schneefux/klicker/components'
import { dimensionRenderers, metricRenderers } from '~/lib/klicker.renderers'

export interface EventMetadata {
  key: string
  id: number
  map: string
  mode: string
  start?: string
  end?: string
  powerplay: boolean
  metrics: Record<string, string|number>
}


declare module 'vue/types/vue' {
  interface Vue {
    $klicker: CustomKlicker
    $managerUrl: string
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $klicker: CustomKlicker
  }
  interface Context {
    $klicker: CustomKlicker
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $klicker: CustomKlicker
  }
}

class CustomKlicker extends Klicker {
  constructor(cubeUrl: string,
      config: Config,
      visualisations: VisualisationSpec[],
      staticWidgets: StaticWidgetSpec[],
      slicers: SlicerSpec[],
      dimensionRenderers: DimensionRendererSpec[],
      metricRenderers: MetricRendererSpec[],
      private context: Context) {
    super(cubeUrl, config, visualisations, staticWidgets, slicers, dimensionRenderers, metricRenderers)
  }

  // override Klicker.$t
  public $te(key: string) {
    return this.context.i18n.t(key) != key
  }

  // override Klicker.$t
  public $t(key: string, args?: any) {
    if (this.$te(key)) {
      return this.context.i18n.t(key, args) as string
    }
    return super.$t(key, args)
  }

  // override Klicker.format
  public format(spec: { type: ValueType, formatter?: string }, value: number|string|string[]): string {
    if (spec.type == 'nominal' && typeof value == 'string') {
      if (spec.formatter == 'formatMode') {
        // TODO remove for i18n
        return formatMode(value)
      }
      if (spec.formatter == 'idToTag') {
        return idToTag(value)
      }
    }
    if (spec.type == 'ordinal' && typeof value == 'number') {
      if (spec.formatter == 'trophyRange') {
        // TODO format leagues
        return (value * 100) as any as string // TODO allow format to return numbers
      }
    }
    return super.format(spec, value)
  }

  async queryActiveEvents(metricsIds: string[] = [], slices: SliceValue = {}, maxage: number|null = 60): Promise<EventMetadata[]> {
    const events = await this.query({
      cubeId: 'map',
      dimensionsIds: ['mode', 'map', 'powerplay'],
      metricsIds: ['eventId', 'timestamp', ...metricsIds],
      slices: {
        season: [formatClickhouseDate(getTodaySeasonEnd())],
        ...slices,
      },
      sortId: 'timestamp',
      limit: 20,
    })

    const lastEvents = events.data
      .map(e => ({
        key: `${e.metricsRaw.eventId}-${e.dimensionsRaw.mode.mode}-${e.dimensionsRaw.map.map}-${e.dimensionsRaw.powerplay.powerplay}`,
        id: parseInt(e.metricsRaw.eventId as string),
        map: e.dimensionsRaw.map.map as string,
        mode: e.dimensionsRaw.mode.mode as string,
        powerplay: e.dimensionsRaw.powerplay.powerplay == '1',
        start: undefined as undefined|string,
        end: undefined as undefined|string,
        metrics: e.metricsRaw,
      }))
      .filter(e => maxage == null || differenceInMinutes(new Date(), parseISO(e.metrics.timestamp as string)) <= maxage)

    const starlistData = await this.context.$http.$get(this.context.$config.apiUrl + '/api/events/active')
      .catch(() => ({ current: [], upcoming: [] })) as CurrentAndUpcomingEvents
    starlistData.current.forEach(s => {
      const match = lastEvents.find(e => e.id.toString() == s.id)
      if (match) {
        match.start = s.start
        match.end = s.end
      }
    })

    return lastEvents
  }

  async queryAllEvents(slices: SliceValue = {}): Promise<EventMetadata[]> {
    const events = await this.query({
      cubeId: 'map',
      dimensionsIds: ['mode', 'map'],
      metricsIds: ['eventId'],
      slices: {
        season: [formatClickhouseDate(getMonthSeasonEnd())],
        mapNotLike: ['Competition'],
        ...slices,
      },
      sortId: 'map',
    })

    return events.data
      .map(e => ({
        key: `${e.metricsRaw.eventId}-${e.dimensionsRaw.mode.mode}-${e.dimensionsRaw.map.map}`,
        id: parseInt(e.metricsRaw.eventId as string),
        map: e.dimensionsRaw.map.map as string,
        mode: e.dimensionsRaw.mode.mode as string,
        powerplay: false,
        metrics: {},
      }))
      .sort((a, b) => {
        const sortMode = this.$t('mode.' + a.mode).localeCompare(this.$t('mode.' + b.mode))
        if (sortMode != 0) {
          return sortMode
        }
        return this.$t('map.' + a.id).localeCompare(this.$t('map.' + b.id))
      })
  }

  async queryAllSeasons(limitWeeks: number = 8): Promise<{ id: string, name: string }[]> {
    const limit = subWeeks(new Date(), limitWeeks)

    const data = await this.query({
      cubeId: 'map',
      dimensionsIds: ['season'],
      metricsIds: [],
      slices: {
        season: [formatClickhouseDate(getSeasonEnd(limit))],
      },
      sortId: 'season',
    })

    return data.data
      .map(e => {
        const d = parseISO(e.dimensionsRaw.season.season)
        return {
          id: formatClickhouseDate(d),
          name: formatDate(subWeeks(d, 2), 'PP') // seasons last 2 weeks
        }
      })
      .sort((e1, e2) => e1.id.localeCompare(e2.id))
      .reverse()
  }

  async queryAllModes(): Promise<string[]> {
    const modes = await this.query({
      cubeId: 'map',
      dimensionsIds: ['mode'],
      metricsIds: [],
      slices: {
        season: [formatClickhouseDate(getMonthSeasonEnd())],
      },
      sortId: 'mode',
    })
    return modes.data
      .map(row => row.dimensionsRaw.mode.mode)
      .sort((a, b) => this.$t('mode.' + a).localeCompare(this.$t('mode.' + b)))
  }

  async queryAllMaps(mode?: string): Promise<{ battle_event_map: string, battle_event_id: number }[]> {
    const maps = await this.query({
      cubeId: 'map',
      dimensionsIds: ['map'],
      metricsIds: ['eventId'],
      slices: {
        season: [formatClickhouseDate(getMonthSeasonEnd())],
        ...(mode != undefined ? {
          mode: [mode],
        } : {}),
      },
      sortId: 'picks',
    })
    return maps.data.map(e => ({
      battle_event_id: e.metricsRaw.eventId as number,
      battle_event_map: e.dimensionsRaw.map.map as string,
    }))
  }

  async queryAllBrawlers(): Promise<string[]> {
    const brawlers = await this.query({
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      metricsIds: [],
      slices: {
        season: [formatClickhouseDate(getTodaySeasonEnd())],
      },
      sortId: 'picks',
    })
    return brawlers.data
      .map(b => b.dimensionsRaw.brawler.brawler)
      .sort((a, b) => a.localeCompare(b))
  }
}

export default defineNuxtPlugin((context, inject) => {
  Vue.component('c-query', CQuery)
  Vue.component('b-shimmer', BShimmer)
  Vue.component('b-card', BCard)
  Vue.component('b-button', BButton)
  Vue.component('b-select', BSelect)
  Vue.component('b-lightbox', BLightbox)
  Vue.component('b-checkbox', BCheckbox)
  Vue.component('b-radio', BRadio)
  Vue.component('b-page', BPage)
  Vue.component('b-page-section', BPageSection)
  Vue.component('b-scrolling-dashboard', BScrollingDashboard)

  const service = new CustomKlicker(context.$config.cubeUrl, config, visualisations, staticWidgets, slicers, dimensionRenderers, metricRenderers, context)

  // onGlobalSetup(() => {
  // })

  inject('klicker', service)
  inject('managerUrl', context.$config.managerUrl)
})
