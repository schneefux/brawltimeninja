import { unformatMode } from "~/lib/util"
import { ActiveEvent } from "~/model/Api"
import { EventMetadata } from "~/plugins/klicker.service"
import { computed } from "vue"
import { useApi, useAsync } from "./compat"
import { useAllEvents } from "./dimension-values"

export function useCurrentAndUpcomingEvents() {
  const $api = useApi()

  const events = useAsync(() => $api.events.active.query().catch(() => ({ current: [], upcoming: [] })), 'events')
  const allEvents = useAllEvents()

  // FIXME simplify this code when the official API returns future events
  // Brawlify's map name formatting differs slightly, overwrite them
  // for example: "Belle's Rock" => "Belles Rock", "Waters of Doom" => "Waters Of Doom"
  const fixName = (event: ActiveEvent & EventMetadata): ActiveEvent & EventMetadata => ({
    ...event,
    ...(allEvents.value.find(e => event.id == e.id) ?? {}),
  })

  const current = computed<(ActiveEvent & EventMetadata)[]>(() => (events.value?.current ?? [])
    .map(e => ({
      id: e.id,
      map: e.map,
      mode: e.mode,
      key: `${e.id}-${e.mode}-${e.map}`,
      metrics: {},
      powerplay: false,
      start: e.start,
      end: e.end,
    }))
    .filter((event, index, all) => all.findIndex(e => e.key == event.key) == index)
    .map(e => fixName(e))
  )

  const upcoming = computed<(ActiveEvent & EventMetadata)[]>(() => (events.value?.upcoming ?? [])
    .map(e => ({
      id: e.id,
      map: e.map,
      mode: unformatMode(e.mode),
      key: `${e.id}-${e.mode}-${e.map}`,
      metrics: {},
      powerplay: false,
      start: e.start,
      end: e.end,
    }))
    .filter((event, index, all) => all.findIndex(e => e.key == event.key) == index)
    .map(e => fixName(e))
  )

  return {
    current,
    upcoming,
  }
}
