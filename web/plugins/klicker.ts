import Vue from 'vue'
import config from '~/lib/klicker.conf'
import { Context, Plugin } from "@nuxt/types"
import { Config, SliceValue, ValueType } from "~/klicker"
import { differenceInMinutes, parseISO, subWeeks, format as formatDate } from "date-fns"
import { CurrentAndUpcomingEvents } from "~/model/Api"
import { formatMode, getCurrentSeasonEnd, idToTag } from "~/lib/util"
import Klicker from '~/klicker/service'
import { CQuery } from '~/klicker/components'

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
    $klicker: KlickerService
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $klicker: KlickerService
  }
  interface Context {
    $klicker: KlickerService
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $klicker: KlickerService
  }
}

class KlickerService extends Klicker {
  constructor(cubeUrl: string, public config: Config, private context: Context) {
    super(cubeUrl, config)
  }

  // override Klicker.$t
  public $te(key: string) {
    return this.context.i18n.t(key) != key
  }

  // override Klicker.$t
  public $t(key: string) {
    if (this.$te(key)) {
      return this.context.i18n.t(key) as string
    }
    return super.$t(key)
  }

  // override Klicker.format
  public format(spec: { type: ValueType, formatter: string }, value: number|string|string[]): string {
    if (spec.type == 'nominal' && typeof value == 'string') {
      if (spec.formatter == 'formatMode') {
        // TODO remove for i18n
        return formatMode(value)
      }
      if (spec.formatter == 'idToTag') {
        return idToTag(value)
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
    }, 10)

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

const plugin: Plugin = (context, inject) => {
  Vue.component('c-query', CQuery)
  const klickerService = new KlickerService(context.$config.cubeUrl, config, context)
  inject('klicker', klickerService)
}

export default plugin
