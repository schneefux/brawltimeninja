import Vue from 'vue'
import config from '~/lib/klicker.conf'
import { Context } from "@nuxt/types"
import { Config, SlicerSpec, SliceValue, StaticWidgetSpec, ValueType, VisualisationSpec } from "@schneefux/klicker/types"
import { differenceInMinutes, parseISO, subWeeks, format as formatDate } from "date-fns"
import { CurrentAndUpcomingEvents } from "~/model/Api"
import { formatMode, getCurrentSeasonEnd, idToTag } from "~/lib/util"
import Klicker from '@schneefux/klicker/service'
import { CQuery } from '@schneefux/klicker/components'
import visualisations from '~/lib/klicker.visualisations.conf'
import slicers from '~/lib/klicker.slicers.conf'
import staticWidgets from '~/lib/klicker.widgets.conf'
import { defineNuxtPlugin } from '@nuxtjs/composition-api'
import { BShimmer, BButton, BCard, BSelect, BLightbox, BCheckbox, BRadio, BWrappedComponent } from '@schneefux/klicker/components'

export interface EventMetadata {
  battle_event_id: number
  battle_event_map: string
  battle_event_mode: string
  battle_event_powerplay: boolean
  timestamp: string
  picks: number
  start?: string
  end?: string
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
      private context: Context) {
    super(cubeUrl, config, visualisations, staticWidgets, slicers)
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

  async queryActiveEvents<T extends EventMetadata>(measures: string[] = [], slices: SliceValue = {}, maxage: number = 60): Promise<T[]> {
    const events = await this.query({
      cubeId: 'map',
      dimensionsIds: ['mode', 'map', 'powerplay'],
      measurementsIds: ['eventId', 'timestamp', 'picks', ...measures],
      slices: {
        season: [getCurrentSeasonEnd().toISOString().slice(0, 10)],
        ...slices,
      },
      sortId: 'timestamp',
      limit: 15,
    })

    const lastEvents = events.data
      .map(e => (<T>{
        battle_event_id: parseInt(e.measurementsRaw.eventId as string),
        battle_event_map: e.dimensionsRaw.map.map as string,
        battle_event_mode: e.dimensionsRaw.mode.mode as string,
        battle_event_powerplay: e.dimensionsRaw.powerplay.powerplay == '1',
        picks: e.measurementsRaw.picks as number,
        timestamp: e.measurementsRaw.timestamp as string,
        ...(measures.reduce((agg, m) => ({
          ...agg,
          [m]: e.measurementsRaw[m],
        }), {})),
      }))
      .filter(e => differenceInMinutes(new Date(), parseISO(e.timestamp)) <= maxage)
      .sort((e1, e2) => e2.picks - e1.picks)

    const starlistData = await this.context.$http.$get(this.context.$config.apiUrl + '/api/events/active')
      .catch(() => ({ current: [], upcoming: [] })) as CurrentAndUpcomingEvents
    starlistData.current.forEach(s => {
      const match = lastEvents.find(e => e.battle_event_id.toString() == s.id)
      if (match) {
        match.start = s.start
        match.end = s.end
      }
    })

    return lastEvents
  }

  async queryAllSeasons(limitWeeks: number = 8): Promise<{ id: string, name: string }[]> {
    const limit = subWeeks(new Date(), limitWeeks)

    const data = await this.query({
      cubeId: 'map',
      dimensionsIds: ['season'],
      measurementsIds: [],
      slices: {
        season: [limit.toISOString().slice(0, 10)],
      },
      sortId: 'season',
    })

    return data.data
      .map(e => {
        const d = parseISO(e.dimensionsRaw.season.season)
        return {
          id: d.toISOString().slice(0, 10),
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
      measurementsIds: [],
      slices: {
        season: [getCurrentSeasonEnd().toISOString().slice(0, 10)],
      },
      sortId: 'picks',
    })
    return modes.data.map(row => row.dimensionsRaw.mode.mode)
  }

  async queryAllMaps(mode?: string): Promise<{ battle_event_map: string, battle_event_id: number }[]> {
    const maps = await this.query({
      cubeId: 'map',
      dimensionsIds: ['map'],
      measurementsIds: ['eventId'],
      slices: {
        season: [getCurrentSeasonEnd().toISOString().slice(0, 10)],
        ...(mode != undefined ? {
          mode: [mode],
        } : {}),
      },
      sortId: 'picks',
    })
    return maps.data.map(e => ({
      battle_event_id: e.measurementsRaw.eventId as number,
      battle_event_map: e.dimensionsRaw.map.map as string,
    }))
  }

  async queryAllBrawlers(): Promise<string[]> {
    const brawlers = await this.query({
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      measurementsIds: [],
      slices: {
        season: [getCurrentSeasonEnd().toISOString().slice(0, 10)],
      },
      sortId: 'picks',
    })
    return brawlers.data.map(b => b.dimensionsRaw.brawler.brawler)
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
  Vue.component('b-wrapped-component', BWrappedComponent) // TODO don't make b-card-content a function component so it can import this

  const service = new CustomKlicker(context.$config.cubeUrl, config, visualisations, staticWidgets, slicers, context)

  // onGlobalSetup(() => {
  // })

  inject('klicker', service)
  inject('managerUrl', context.$config.managerUrl)
})
