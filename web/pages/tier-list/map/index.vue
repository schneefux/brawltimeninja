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

      <p class="mx-2 flex flex-wrap md:justify-center md:mx-auto mt-4">
        <span class="text-xl w-full md:text-center">
          Table of Contents
        </span>
        <ul class="mx-3 mt-2 border-l px-2">
          <li>
            <a href="#current">
              Live now
            </a>
          </li>
          <li class="mt-2">
            <a href="#upcoming">
              Up next
            </a>
          </li>
          <li
            v-for="(_, mode) in events"
            :key="mode"
            class="mt-2"
          >
            <a :href="`#${mode}`">
              {{ formatMode(mode) }}
            </a>
          </li>
        </ul>
      </p>

      <adsense
        v-if="ads"
        ins-class="h-24 mt-6 text-center"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="8877810024"
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
          class="mt-6"
        >
          <summary
            class="mx-2 text-xl md:text-center font-semibold"
            @click="$set(load, 'upcoming', true)"
          >
            Up next
          </summary>
          <div
            v-if="load['upcoming']"
            class="flex flex-wrap justify-center"
          >
            <event-card
              v-for="event in upcomingEvents"
              :key="event.id"
              :event="event"
            />
          </div>
        </details>

        <adsense
          v-if="ads && !isApp"
          ins-class="h-24 mt-6 text-center"
          data-ad-client="ca-pub-6856963757796636"
          data-ad-slot="3577381889"
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
import { formatMode } from '~/store/index'
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
