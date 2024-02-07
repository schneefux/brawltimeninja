import { useKlicker } from "@schneefux/klicker/composables"
import { brawlerId, capitalizeWords, formatClickhouseDate, getMonthSeasonEnd, getSeasonEnd, getTodaySeasonEnd, parseClickhouse } from "~/lib/util"
import { EventMetadata } from "~/plugins/klicker.service"
import { SliceValue } from "@schneefux/klicker/types"
import { differenceInMinutes, parseISO, subWeeks } from "date-fns"
import { computed, MaybeRef, ref, unref } from "vue"
import { useI18n } from "vue-i18n"
import { useAsync, useApi } from "./compat"

export function useAllEvents(slices: MaybeRef<SliceValue> = ref({})) {
  const $klicker = useKlicker()
  const i18n = useI18n()
  const key = computed(() => `active-events-${JSON.stringify(unref(slices))}`)

  const events = useAsync<EventMetadata[]>(async () => {
    const data = await $klicker.query({
      cubeId: 'map',
      dimensionsIds: ['mode', 'map'],
      metricsIds: ['eventId'],
      slices: {
        season: [formatClickhouseDate(getMonthSeasonEnd())],
        mapNotLike: ['Competition'],
        ...unref(slices),
      },
      sortId: 'map',
    })

    return data.data
      .map(e => ({
        key: `${e.metricsRaw.eventId}-${e.dimensionsRaw.mode.mode}-${e.dimensionsRaw.map.map}`,
        id: e.metricsRaw.eventId as string,
        map: e.dimensionsRaw.map.map as string,
        mode: e.dimensionsRaw.mode.mode as string,
        powerplay: false,
        metrics: {},
      }))
  }, key)

  return computed(() => (events.value ?? [])
    .slice()
    .sort((a, b) => {
      const sortMode = i18n.t('mode.' + a.mode).localeCompare(i18n.t('mode.' + b.mode), i18n.locale.value)
      if (sortMode != 0) {
        return sortMode
      }
      return i18n.t('map.' + a.id).localeCompare(i18n.t('map.' + b.id), i18n.locale.value)
    })
  )
}

export function useActiveEvents(metricsIds: MaybeRef<string[]> = ref([]), slices: MaybeRef<SliceValue> = ref({}), maxage: number|null = 60) {
  const $klicker = useKlicker()
  const $api = useApi()
  const key = computed(() => `active-events-${unref(metricsIds).join('-')}-${JSON.stringify(unref(slices))}-${maxage}`)

  const lastEvents = useAsync<EventMetadata[]>(async () => {
    const data = await $klicker.query({
      cubeId: 'map',
      dimensionsIds: ['mode', 'map', 'powerplay'],
      metricsIds: ['eventId', 'timestamp', ...unref(metricsIds)],
      slices: {
        season: [formatClickhouseDate(getTodaySeasonEnd())],
        ...unref(slices),
      },
      sortId: 'timestamp',
      limit: 20,
    })

    return data.data
      .map(e => ({
        key: `${e.metricsRaw.eventId}-${e.dimensionsRaw.mode.mode}-${e.dimensionsRaw.map.map}-${e.dimensionsRaw.powerplay.powerplay}`,
        id: e.metricsRaw.eventId as string,
        map: e.dimensionsRaw.map.map as string,
        mode: e.dimensionsRaw.mode.mode as string,
        powerplay: e.dimensionsRaw.powerplay.powerplay == '1',
        metrics: e.metricsRaw,
      }))
      .filter(e => maxage == null || differenceInMinutes(new Date(), parseISO(e.metrics.timestamp as string)) <= maxage)
  }, key)

  const starlistKey = computed(() => `active-events-starlist-${unref(metricsIds).join('-')}-${JSON.stringify(unref(slices))}-${maxage}`)
  const starlistData = useAsync(async () => await $api.events.active.query()
    .catch(() => ({ current: [], upcoming: [] })), starlistKey)

  return computed<EventMetadata[]>(() => lastEvents.value?.map(e => {
    const brawlifyEvent = starlistData.value?.current.find(s => e.id.toString() == s.id)

    return {
      ...e,
      start: brawlifyEvent?.start,
      end: brawlifyEvent?.end,
    }
  }) ?? [])
}

export function useAllSeasons(limitWeeks: MaybeRef<number> = ref(8)) {
  const $klicker = useKlicker()
  const key = computed(() => `all-seasons-${unref(limitWeeks)}`)

  const data = useAsync(async () => {
    const limit = subWeeks(new Date(), unref(limitWeeks))
    const data = await $klicker.query({
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
        const d = parseClickhouse(e.dimensionsRaw.season.season)
        return {
          id: formatClickhouseDate(d),
          start: subWeeks(d, 2) // seasons last 2 weeks
        }
      })
      .sort((e1, e2) => e2.start.valueOf() - e1.start.valueOf()) ?? []
  }, key)

  return computed(() => data.value ?? [])
}

export function useAllModes() {
  const $klicker = useKlicker()
  const i18n = useI18n()

  const modes = useAsync(async () => {
    const data = await $klicker.query({
      cubeId: 'map',
      dimensionsIds: ['mode'],
      metricsIds: [],
      slices: {
        season: [formatClickhouseDate(getMonthSeasonEnd())],
      },
      sortId: 'mode',
    })

    return data.data.map(row => row.dimensionsRaw.mode.mode)
  }, 'all-modes')

  return computed(() => (modes.value ?? [])
    .slice()
    .sort((a, b) => i18n.t('mode.' + a).localeCompare(i18n.t('mode.' + b), i18n.locale.value))
  )
}

export function useAllMaps(mode: MaybeRef<string|undefined> = ref()) {
  const $klicker = useKlicker()
  const key = computed(() => `all-maps-${unref(mode) ?? 'all'}`)

  const maps = useAsync<{ battle_event_map: string, battle_event_id: number }[]>(async () => {
    const data = await $klicker.query({
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
    })

    return data.data.map(e => ({
      battle_event_id: e.metricsRaw.eventId as number,
      battle_event_map: e.dimensionsRaw.map.map as string,
    }))
  }, key)

  return computed(() => maps.value ?? [])
}

export interface BrawlerMetadata {
  /** URL-safe ID */
  slug: string
  /** used in the database */
  brawlstarsId: string
  /** formatted name */
  name: string
}

export function useAllBrawlers() {
  const $klicker = useKlicker()
  const i18n = useI18n()

  const brawlers = useAsync<BrawlerMetadata[]>(async () => {
    const data = await $klicker.query({
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      metricsIds: [],
      slices: {
        season: [formatClickhouseDate(getTodaySeasonEnd())],
      },
      sortId: 'picks',
    })

    return data.data
      .map(b => b.dimensionsRaw.brawler.brawler)
      .map(b => ({
        slug: brawlerId({ name: b }),
        brawlstarsId: b,
        name: capitalizeWords(b.toLowerCase()),
      }))
  }, 'all-brawlers')

  return computed(() => (brawlers.value ?? [])
    .slice()
    .sort((b1, b2) => b1.name.localeCompare(b2.name, i18n.locale.value))
  )
}
