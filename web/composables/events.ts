import { unformatMode } from "~/lib/util"
import { ActiveEvent } from "~/model/Api"
import { EventMetadata } from "~/plugins/klicker.service"
import { computed } from "vue"
import { useApi, useAsync } from "./compat"

export function useCurrentAndUpcomingEvents() {
  const $api = useApi()

  const events = useAsync(() => $api.events.active.query().catch(() => ({ current: [], upcoming: [] })), 'events')

  const current = computed<(ActiveEvent & EventMetadata)[]>(() => (events.value?.current ?? []).map(e => ({
    id: e.id,
    map: e.map,
    mode: unformatMode(e.mode),
    key: `${e.id}-${e.mode}-${e.map}`,
    metrics: {},
    powerplay: false,
    start: e.start,
    end: e.end,
  })).filter((event, index, all) => all.findIndex(e => e.key == event.key) == index))

  const upcoming = computed<(ActiveEvent & EventMetadata)[]>(() => (events.value?.upcoming ?? []).map(e => ({
    id: e.id,
    map: e.map,
    mode: unformatMode(e.mode),
    key: `${e.id}-${e.mode}-${e.map}`,
    metrics: {},
    powerplay: false,
    start: e.start,
    end: e.end,
  })).filter((event, index, all) => all.findIndex(e => e.key == event.key) == index))

  return {
    current,
    upcoming,
  }
}
