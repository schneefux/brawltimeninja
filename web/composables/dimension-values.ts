import { useKlicker } from "@schneefux/klicker/composables"
import { capitalizeWords, formatClickhouseDate, getMonthSeasonEnd, getSeasonEnd, getTodaySeasonEnd } from "@/lib/util"
import { EventMetadata } from "@/plugins/klicker.service"
import { SliceValue } from "@schneefux/klicker/types"
import { differenceInMinutes, parseISO, subWeeks, format } from "date-fns"
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { useAsync, useApi } from "./compat"

export function useAllEvents(slices: SliceValue = {}) {
  const $klicker = useKlicker()
  const i18n = useI18n()
  const key = `active-events-${JSON.stringify(slices)}`

  const events = useAsync(() => $klicker.query({
    cubeId: 'map',
    dimensionsIds: ['mode', 'map'],
    metricsIds: ['eventId'],
    slices: {
      season: [formatClickhouseDate(getMonthSeasonEnd())],
      mapNotLike: ['Competition'],
      ...slices,
    },
    sortId: 'map',
  }), key)

  const mappedEvents = computed<EventMetadata[]>(() => (events.value?.data ?? [])
    .map(e => ({
      key: `${e.metricsRaw.eventId}-${e.dimensionsRaw.mode.mode}-${e.dimensionsRaw.map.map}`,
      id: e.metricsRaw.eventId as string,
      map: e.dimensionsRaw.map.map as string,
      mode: e.dimensionsRaw.mode.mode as string,
      powerplay: false,
      metrics: {},
    }))
    .sort((a, b) => {
      const sortMode = i18n.t('mode.' + a.mode).localeCompare(i18n.t('mode.' + b.mode))
      if (sortMode != 0) {
        return sortMode
      }
      return i18n.t('map.' + a.id).localeCompare(i18n.t('map.' + b.id))
    })
  )

  return mappedEvents
}

export function useActiveEvents(metricsIds: string[] = [], slices: SliceValue = {}, maxage: number|null = 60) {
  const $klicker = useKlicker()
  const $api = useApi()
  const key = `active-events-${metricsIds.join('-')}-${JSON.stringify(slices)}-${maxage}`

  const events = useAsync(() => $klicker.query({
    cubeId: 'map',
    dimensionsIds: ['mode', 'map', 'powerplay'],
    metricsIds: ['eventId', 'timestamp', ...metricsIds],
    slices: {
      season: [formatClickhouseDate(getTodaySeasonEnd())],
      ...slices,
    },
    sortId: 'timestamp',
    limit: 20,
  }), key)

  const starlistData = useAsync(async () => await $api.events.active.query()
    .catch(() => ({ current: [], upcoming: [] })), key + '-starlist')

  const lastEvents = computed<EventMetadata[]>(() => {
    const lastEvents = events.value?.data
      .map(e => ({
        key: `${e.metricsRaw.eventId}-${e.dimensionsRaw.mode.mode}-${e.dimensionsRaw.map.map}-${e.dimensionsRaw.powerplay.powerplay}`,
        id: e.metricsRaw.eventId as string,
        map: e.dimensionsRaw.map.map as string,
        mode: e.dimensionsRaw.mode.mode as string,
        powerplay: e.dimensionsRaw.powerplay.powerplay == '1',
        start: undefined as undefined|string,
        end: undefined as undefined|string,
        metrics: e.metricsRaw,
      }))
      .filter(e => maxage == null || differenceInMinutes(new Date(), parseISO(e.metrics.timestamp as string)) <= maxage)

    starlistData.value?.current.forEach(s => {
      const match = lastEvents?.find(e => e.id.toString() == s.id)
      if (match) {
        match.start = s.start
        match.end = s.end
      }
    })

    return lastEvents ?? []
  })

  return lastEvents
}

export function useAllSeasons(limitWeeks: number = 8) {
  const limit = subWeeks(new Date(), limitWeeks)
  const $klicker = useKlicker()
  const key = `all-seasons-${limitWeeks}`

  const data = useAsync(() => $klicker.query({
    cubeId: 'map',
    dimensionsIds: ['season'],
    metricsIds: [],
    slices: {
      season: [formatClickhouseDate(getSeasonEnd(limit))],
    },
    sortId: 'season',
  }), key)

  const seasons = computed<{ id: string, name: string }[]>(() => data.value?.data
    .map(e => {
      const d = parseISO(e.dimensionsRaw.season.season)
      return {
        id: formatClickhouseDate(d),
        name: format(subWeeks(d, 2), 'PP') // seasons last 2 weeks
      }
    })
    .sort((e1, e2) => e1.id.localeCompare(e2.id))
    .reverse() ?? []
  )

  return seasons
}

export function useAllModes() {
  const $klicker = useKlicker()
  const i18n = useI18n()

  const modes = useAsync(() => $klicker.query({
    cubeId: 'map',
    dimensionsIds: ['mode'],
    metricsIds: [],
    slices: {
      season: [formatClickhouseDate(getMonthSeasonEnd())],
    },
    sortId: 'mode',
  }), 'all-modes')

  const modesMapped = computed<string[]>(() => modes.value?.data
    .map(row => row.dimensionsRaw.mode.mode)
    .sort((a, b) => i18n.t('mode.' + a).localeCompare(i18n.t('mode.' + b))) ?? []
  )

  return modesMapped
}

export function useAllMaps(mode?: string) {
  const $klicker = useKlicker()
  const key = `all-maps-${mode}`

  const maps = useAsync(() => $klicker.query({
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
  }), key)

  const mappedMaps = computed<{ battle_event_map: string, battle_event_id: number }[]>(() =>
    maps.value?.data.map(e => ({
      battle_event_id: e.metricsRaw.eventId as number,
      battle_event_map: e.dimensionsRaw.map.map as string,
    })) ?? [])

  return mappedMaps
}

export function useAllBrawlers() {
  const $klicker = useKlicker()

  const brawlers = useAsync(() => $klicker.query({
    cubeId: 'map',
    dimensionsIds: ['brawler'],
    metricsIds: [],
    slices: {
      season: [formatClickhouseDate(getTodaySeasonEnd())],
    },
    sortId: 'picks',
  }), 'all-brawlers')

  const brawlersMapped = computed<{ id: string, name: string }[]>(() => brawlers.value?.data
    .map(b => b.dimensionsRaw.brawler.brawler)
    .sort((b1, b2) => b1.localeCompare(b2))
    .map(b => ({
      id: b,
      name: capitalizeWords(b.toLowerCase()),
    })) ?? [])

  return brawlersMapped
}
