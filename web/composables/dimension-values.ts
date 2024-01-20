import { useKlicker } from "@schneefux/klicker/composables"
import { capitalizeWords, formatClickhouseDate, getMonthSeasonEnd, getSeasonEnd, getTodaySeasonEnd, parseClickhouse } from "~/lib/util"
import { EventMetadata } from "~/plugins/klicker.service"
import { SliceValue } from "@schneefux/klicker/types"
import { differenceInMinutes, parseISO, subWeeks, format } from "date-fns"
import { computed, MaybeRef, Ref, ref, unref } from "vue"
import { useI18n } from "vue-i18n"
import { useAsync, useApi } from "./compat"

export function useAllEvents(slices: MaybeRef<SliceValue> = ref({})) {
  const $klicker = useKlicker()
  const i18n = useI18n()
  const key = computed(() => `active-events-${JSON.stringify(unref(slices))}`)

  const events = useAsync(() => $klicker.query({
    cubeId: 'map',
    dimensionsIds: ['mode', 'map'],
    metricsIds: ['eventId'],
    slices: {
      season: [formatClickhouseDate(getMonthSeasonEnd())],
      mapNotLike: ['Competition'],
      ...unref(slices),
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
      const sortMode = i18n.t('mode.' + a.mode).localeCompare(i18n.t('mode.' + b.mode), i18n.locale.value)
      if (sortMode != 0) {
        return sortMode
      }
      return i18n.t('map.' + a.id).localeCompare(i18n.t('map.' + b.id), i18n.locale.value)
    })
  )

  return mappedEvents
}

export function useActiveEvents(metricsIds: MaybeRef<string[]> = ref([]), slices: MaybeRef<SliceValue> = ref({}), maxage: number|null = 60) {
  const $klicker = useKlicker()
  const $api = useApi()
  const key = computed(() => `active-events-${unref(metricsIds).join('-')}-${JSON.stringify(unref(slices))}-${maxage}`)

  const events = useAsync(() => $klicker.query({
    cubeId: 'map',
    dimensionsIds: ['mode', 'map', 'powerplay'],
    metricsIds: ['eventId', 'timestamp', ...unref(metricsIds)],
    slices: {
      season: [formatClickhouseDate(getTodaySeasonEnd())],
      ...unref(slices),
    },
    sortId: 'timestamp',
    limit: 20,
  }), key)

  const starlistKey = computed(() => `active-events-starlist-${unref(metricsIds).join('-')}-${JSON.stringify(unref(slices))}-${maxage}`)
  const starlistData = useAsync(async () => await $api.events.active.query()
    .catch(() => ({ current: [], upcoming: [] })), starlistKey)

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

export function useAllSeasons(limitWeeks: MaybeRef<number> = ref(8)) {
  const $klicker = useKlicker()
  const key = computed(() => `all-seasons-${unref(limitWeeks)}`)

  const data = useAsync(() => {
    const limit = subWeeks(new Date(), unref(limitWeeks))
    return $klicker.query({
      cubeId: 'map',
      dimensionsIds: ['season'],
      metricsIds: [],
      slices: {
        season: [formatClickhouseDate(getSeasonEnd(limit))],
      },
      sortId: 'season',
    })
  }, key)

  const seasons = computed<{ id: string, start: Date }[]>(() => data.value?.data
    .map(e => {
      const d = parseClickhouse(e.dimensionsRaw.season.season)
      return {
        id: formatClickhouseDate(d),
        start: subWeeks(d, 2) // seasons last 2 weeks
      }
    })
    .sort((e1, e2) => e2.start.valueOf() - e1.start.valueOf()) ?? []
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
    .sort((a, b) => i18n.t('mode.' + a).localeCompare(i18n.t('mode.' + b), i18n.locale.value)) ?? []
  )

  return modesMapped
}

export function useAllMaps(mode: MaybeRef<string|undefined> = ref()) {
  const $klicker = useKlicker()
  const key = computed(() => `all-maps-${unref(mode) ?? 'all'}`)

  const maps = useAsync(() => $klicker.query({
    cubeId: 'map',
    dimensionsIds: ['map'],
    metricsIds: ['eventId'],
    slices: {
      season: [formatClickhouseDate(getMonthSeasonEnd())],
      ...(unref(mode) != undefined ? {
        mode: [unref(mode)],
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
  const i18n = useI18n()

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
    .sort((b1, b2) => b1.localeCompare(b2, i18n.locale.value))
    .map(b => ({
      id: b,
      name: capitalizeWords(b.toLowerCase()),
    })) ?? [])

  return brawlersMapped
}
