<template>
  <div class="py-4 px-2">
    <div class="my-8 container mx-auto">
      <h1 class="mx-2 text-4xl md:text-center mt-2 font-semibold">
        Map Tier Lists
      </h1>

      <p class="md:text-center px-2 mt-6 max-w-lg mx-auto">
        Brawler Tier Lists for all maps in Brawl Stars.
        Click on a map and see the best Brawlers for all Brawl Stars Events.
        The data is from battles played in the current season.
      </p>

      <adsense
        v-if="ads"
        id="ezoic-pub-ad-placeholder-110"
        ins-class="h-24 mt-6 text-center"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="8877810024"
        data-ad-format="auto"
      />

      <div class="mt-6">
        <details
          id="current"
          open
        >
          <summary class="mx-2 text-xl md:text-center font-semibold">
            Live now
          </summary>
          <div class="flex flex-wrap justify-center">
            <event-card
              v-for="event in currentEvents"
              :key="event.id"
              :event="event"
            />
          </div>
        </details>

        <details
          id="upcoming"
          open
          class="mt-6"
        >
          <summary class="mx-2 text-xl md:text-center font-semibold">
            Up next
          </summary>
          <div class="flex flex-wrap justify-center">
            <event-card
              v-for="event in upcomingEvents"
              :key="event.id"
              :event="event"
            />
          </div>
        </details>

        <adsense
          v-if="ads && !isApp"
          id="ezoic-pub-ad-placeholder-111"
          ins-class="h-24 mt-6 text-center"
          data-ad-client="ca-pub-6856963757796636"
          data-ad-slot="3577381889"
          data-ad-format="auto"
        />

        <h2 class="mt-6 mx-2 text-xl md:text-center font-semibold">
          All maps
        </h2>
        <details
          v-for="(modeEvents, mode) in events"
          :id="mode"
          :key="mode"
          class="mt-4"
        >
          <summary
            class="mx-2 md:text-center text-lg font-semibold capitalize"
            @click="$set(load, mode, true)"
          >
            <span class="w-48 inline-block text-left">
              {{ formatMode(mode) }}
            </span>
          </summary>
          <div
            class="flex flex-wrap justify-center"
          >
            <event-card
              v-for="event in modeEvents"
              :load="load[mode]"
              :key="event.id"
              :event="event"
            />
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { formatMode } from '~/lib/util'
import EventCard from '~/components/event-card.vue'

export default {
  name: 'MetaSelectMapPage',
  components: {
    EventCard,
  },
  data() {
    return {
      load: {},
      formatMode,
    }
  },
  head() {
    const description = 'Brawl Stars Tier List with Win Rates, Pick Rates and Rankings. Find the best Brawlers for all maps.'
    return {
      title: 'Map Tier List',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  computed: {
    events() {
      return [...Object.entries(this.mapMeta)]
        .map(([eventId, event]) => ({
          id: eventId,
          mode: event.mode,
          map: event.map,
        }))
        .sort((e1, e2) => e1.map > e2.map ? 1 : e1.map < e2.map ? -1 : 0)
        .reduce((eventsByMode, event) => ({
          ...eventsByMode,
          [event.mode]: (eventsByMode[event.mode] || []).concat([event]),
        }), {})
    },
    ...mapState({
      currentEvents: state => state.currentEvents,
      upcomingEvents: state => state.upcomingEvents,
      mapMeta: state => state.mapMeta,
      ads: state => state.adsEnabled,
      isApp: state => state.isApp,
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await Promise.all([
        store.dispatch('loadCurrentEvents'),
        store.dispatch('loadUpcomingEvents'),
        store.dispatch('loadMapMeta'),
      ])
    }
  },
  async created() {
    if (process.static) {
      await Promise.all([
        this.loadCurrentEvents(),
        this.loadUpcomingEvents(),
        this.loadMapMeta(),
      ])
    }
  },
  methods: {
    ...mapActions({
      loadCurrentEvents: 'loadCurrentEvents',
      loadUpcomingEvents: 'loadUpcomingEvents',
      loadMapMeta: 'loadMapMeta',
    }),
  },
}
</script>
