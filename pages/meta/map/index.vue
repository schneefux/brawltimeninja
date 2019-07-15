<template>
  <div class="py-4 px-2">
    <div class="my-8">
      <h1 class="mx-2 text-4xl md:text-center mt-2 font-semibold">
        Map Meta
      </h1>
      <p class="mx-2 text-xl md:text-center mt-2">
        Select a Map
      </p>

      <div class="mt-6">
        <h2 class="mx-2 text-xl md:text-center font-semibold">
          Live right now
        </h2>
        <div class="flex flex-wrap justify-center">
          <event-card
            v-for="event in currentEvents"
            :key="event.id"
            :event="event"
          />
        </div>

        <h2 class="mx-2 text-xl md:text-center font-semibold">
          Up next
        </h2>
        <div class="flex flex-wrap justify-center">
          <event-card
            v-for="event in upcomingEvents"
            :key="event.id"
            :event="event"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import EventCard from '~/components/event-card.vue'

export default {
  name: 'MetaSelectMapPage',
  components: {
    EventCard,
  },
  head() {
    return {
      title: 'Map Meta',
    }
  },
  computed: {
    events() {
      // TODO add endpoint for all maps
      // get a list of events with data for every brawler
      const commonEventIds = this.meta.map(entry => [...Object.keys(entry.events)])
        .reduce((acc, cur, index) => index === 0 ? cur : cur.filter(m => acc.includes(m)), [])
        .sort()
      return commonEventIds.reduce((events, id) => events.concat([{
        id: id,
        mode: this.meta[0].events[id].mode,
        map: this.meta[0].events[id].map,
      }]), [])
    },
    ...mapState({
      currentEvents: state => state.currentEvents,
      upcomingEvents: state => state.upcomingEvents,
      meta: state => state.mapMeta,
      ads: state => state.adsAllowed,
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadCurrentEvents')
      await store.dispatch('loadUpcomingEvents')
      await store.dispatch('loadMapMeta')
    }
  },
  async mounted() {
    if (process.static) {
      await this.loadCurrentEvents()
      await this.loadUpcomingEvents()
      await this.loadMapMeta()
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
