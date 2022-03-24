<template>
  <b-page :title="$t('tier-list.maps.title')">
    <p class="mt-4 prose dark:prose-invert">
      {{ $t('tier-list.maps.description') }}
     </p>

    <ad
      ad-slot="8877810024"
      first
    ></ad>

    <b-page-section
      v-if="currentEvents.length > 0"
      :title="$t('events.active.title')"
      v-observe-visibility="{
        callback: makeVisibilityCallback('current_events'),
        once: true,
      }"
    >
      <events-roll
        :events="currentEvents"
        with-data
      ></events-roll>
    </b-page-section>

    <b-page-section
      v-if="powerleagueEvents != undefined"
      :title="$t('events.powerleague.title')"
      v-observe-visibility="{
        callback: makeVisibilityCallback('powerleague_events'),
        once: true,
      }"
    >
      <events-roll
        :events="powerleagueEvents"
        with-data
      ></events-roll>
    </b-page-section>

    <ad
      ad-slot="4150756245"
      lazy
    ></ad>

    <b-page-section
      v-if="upcomingEvents.length > 0"
      :title="$t('events.upcoming.title')"
      v-observe-visibility="{
        callback: makeVisibilityCallback('upcoming_events'),
        once: true,
      }"
    >
      <events-roll
        :events="upcomingEvents"
        with-data
      ></events-roll>
    </b-page-section>

    <b-page-section
      :title="$t('events.season.title')"
      v-if="allEvents != undefined && allEvents.length > 0"
      v-observe-visibility="{
        callback: makeVisibilityCallback('maps'),
        once: true,
      }"
    >
      <events-roll :events="allEvents"></events-roll>
    </b-page-section>

    <ad
      ad-slot="3577381889"
      lazy
    ></ad>

  </b-page>
</template>

<script lang="ts">
import { computed, defineComponent, useAsync, useContext, useMeta } from '@nuxtjs/composition-api'
import { formatAsJsonLd, getSeasonEnd, unformatMode } from '@/lib/util'
import { CurrentAndUpcomingEvents, ActiveEvent } from '@/model/Api'
import { CDashboardCell } from '@schneefux/klicker/components'
import { useTrackScroll } from '~/composables/gtag'

export default defineComponent({
  head: {},
  components: {
    CDashboardCell,
  },
  setup() {
    const { $http, $config, i18n, $klicker } = useContext()
    const events = useAsync(() => $http.$get<CurrentAndUpcomingEvents>($config.apiUrl + '/api/events/active'))
    const currentEvents = computed(() => (events.value?.current ?? []).map(e => ({
      ...e,
      mode: unformatMode(e.mode)
    })))
    const upcomingEvents = computed(() => (events.value?.upcoming ?? []).map(e => ({
      ...e,
      mode: unformatMode(e.mode)
    })))

    const twoWeeksAgo = new Date()
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
    const currentSeason = getSeasonEnd(twoWeeksAgo)
    const allEvents = useAsync(() => $klicker.queryActiveEvents([], {
      season: [currentSeason.toISOString().slice(0, 10)],
    }, null))

    const powerleagueEvents = useAsync(() => $klicker.queryActiveEvents([], {
      powerplay: ['1'],
    }))

    useMeta(() => {
      const description = i18n.tc('tier-list.maps.meta.description', 1)
      const structuredData = (<ActiveEvent[]>[]).concat(events.value?.current ?? [], events.value?.upcoming ?? [])
        .map((event) => ({
          type: 'application/ld+json',
          json: formatAsJsonLd({
            id: event.id,
            map: (i18n.te(`map.${event.id}`) && i18n.t(`map.${event.id}`) || event.map) as string,
            mode: i18n.t('mode.' + event.mode) as string,
            start: event.start,
            end: event.end,
          }, $config.mediaUrl),
        }))

      return {
        title: i18n.tc('tier-list.maps.meta.title', 1),
        meta: [
          { hid: 'description', name: 'description', content: description },
          { hid: 'og:description', property: 'og:description', content: description },
        ],
        script: structuredData,
      }
    })

    const { makeVisibilityCallback } = useTrackScroll('maps')

    return {
      allEvents,
      currentEvents,
      upcomingEvents,
      powerleagueEvents,
      unformatMode,
      makeVisibilityCallback,
    }
  },
  meta: {
    title: 'Events',
    screen: 'events',
  },
  middleware: ['cached'],
})
</script>
