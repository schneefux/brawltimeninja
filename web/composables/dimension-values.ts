import { useKlicker } from "@schneefux/klicker/composables"
import { brawlerId, capitalizeWords, formatClickhouseDate, getMonthSeasonEnd, getSeasonEnd, getTodaySeasonEnd, parseClickhouse } from "~/lib/util"
import { EventMetadata } from "~/plugins/klicker.service"
import { SliceValue } from "@schneefux/klicker/types"
import { differenceInMinutes, parseISO, subWeeks } from "date-fns"
import { computed, MaybeRef, ref, unref } from "vue"
import { useI18n } from "vue-i18n"
import { useAsync, useApi } from "./compat"
import { getMapName } from "./map"

export function useAllEvents(slices: MaybeRef<SliceValue> = ref({})) {
  const $klicker = useKlicker()
  const i18n = useI18n()
  const key = computed(() => `active-events-${JSON.stringify(unref(slices))}`)

  const events = useAsync<Omit<EventMetadata, 'modeTranslated'|'mapTranslated'>[]>(async () => {
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
    .map(e => ({
      ...e,
      mapTranslated: getMapName(i18n, e.id, e.map) ?? '',
      modeTranslated: i18n.t('mode.' + e.mode),
    }))
    .sort((a, b) => {
      const sortMode = a.modeTranslated.localeCompare(b.modeTranslated, i18n.locale.value)
      if (sortMode != 0) {
        return sortMode
      }
      return a.mapTranslated.localeCompare(b.mapTranslated, i18n.locale.value)
    })
  )
}

export function useActiveEvents(metricsIds: MaybeRef<string[]> = ref([]), slices: MaybeRef<SliceValue> = ref({}), maxage: number|null = 60) {
  const $klicker = useKlicker()
  const $api = useApi()
  const i18n = useI18n()
  const key = computed(() => `active-events-${unref(metricsIds).join('-')}-${JSON.stringify(unref(slices))}-${maxage}`)

  const lastEvents = useAsync<Omit<EventMetadata, 'modeTranslated'|'mapTranslated'>[]>(async () => {
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
      mapTranslated: getMapName(i18n, e.id, e.map) ?? '',
      modeTranslated: i18n.t('mode.' + e.mode),
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
    .map(m => ({
      mode: m,
      translated: i18n.t('mode.' + m),
    }))
    .sort((a, b) => a.translated.localeCompare(b.translated, i18n.locale.value))
    .map(m => m.mode)
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

export function useAllBrawlersCount() {
  const brawlers = useAllBrawlers()
  return computed(() => brawlers.value.length)
}

function useAllBrawlersAccessories(accessoryKind: 'gears'|'gadgets'|'starpowers') {
  const keys = {
    'gears': 'gear',
    'gadgets': 'gadget',
    'starpowers': 'starpower',
  } as const

  const $klicker = useKlicker()
  const i18n = useI18n()

  const acessories = useAsync<{ brawler: BrawlerMetadata, accessory: BrawlerMetadata }[]>(async () => {
    const singular = keys[accessoryKind]

    const data = await $klicker.query({
      cubeId: 'battle',
      dimensionsIds: ['brawler', singular],
      metricsIds: [],
      slices: {
        season: [formatClickhouseDate(getMonthSeasonEnd())],
        [singular + 'IdNeq']: ['0'],
      },
      sortId: 'picks',
    })

    return data.data
      .map(b => ({
        brawler: b.dimensionsRaw.brawler.brawler,
        accessory: b.dimensionsRaw[singular][singular + 'Name'],
      }))
      .map(b => ({
        brawler: {
          brawlstarsId: b.brawler,
          name: capitalizeWords(b.brawler.toLowerCase()),
          slug: brawlerId({ name: b.brawler }),
        },
        accessory: {
          brawlstarsId: b.accessory,
          name: capitalizeWords(b.accessory.toLowerCase()),
          slug: brawlerId({ name: b.accessory }),
        }
      }))
  }, 'all-accessories-' + accessoryKind)

  return computed(() => (acessories.value ?? [])
    .slice()
    .sort((a1, a2) => `${a1.brawler.name} ${a1.accessory.name}`.localeCompare(`${a2.brawler.name} ${a2.accessory.name}`, i18n.locale.value))
  )
}

export function useAllBrawlersWithAllAccessories() {
  const brawlers = useAllBrawlers()
  const gadgets = useAllBrawlersAccessories('gadgets')
  const starpowers = useAllBrawlersAccessories('starpowers')
  const gears = useAllBrawlersAccessories('gears')

  return computed(() => brawlers.value.map(b => ({
    ...b,
    gadgets: gadgets.value.filter(g => g.brawler.brawlstarsId == b.brawlstarsId),
    starpowers: starpowers.value.filter(g => g.brawler.brawlstarsId == b.brawlstarsId),
    gears: gears.value
      .filter(g => !(g.brawler.name == 'Colt' && g.accessory.name == 'Super Charge')) // FIXME remove, API reported 4 battles with gear that does not exist
      .filter(g => g.brawler.brawlstarsId == b.brawlstarsId),
  }))
  )
}
