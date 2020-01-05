<template>
  <div>
    <h1 class="mt-4 text-2xl text-center">
      Best Brawlers for Current Events
    </h1>
    <h2 class="mt-2 text-sm text-center">
      Track trophies and view Brawler win rates on
      <a
        class="link-light underline"
        href="https://brawltime.ninja"
        target="_blank"
      >
        brawltime.ninja
      </a>
    </h2>
    <div class="mt-1 flex flex-wrap justify-center">
      <div
        v-for="event in currentEvents"
        :key="event.id"
        class="w-80"
      >
        <event-card
          :event="event"
          class="rounded-lg"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { metaStatMaps } from '~/store/index'
import EventCard from '~/components/event-card'

export default {
  layout: 'empty',
  components: {
    EventCard,
  },
  head() {
    return {
      title: 'Live Events Tier List Widget',
    }
  },
  data() {
    return {
      metaStatMaps,
    }
  },
  computed: {
    ...mapState({
      currentEvents: state => state.currentEvents,
    }),
  },
  async fetch({ store }) {
    if (!process.static) {
      await store.dispatch('loadCurrentMeta')
    }
  },
  created() {
    if (process.static) {
      this.loadCurrentMeta()
    }
  },
  methods: {
    ...mapActions({
      loadCurrentMeta: 'loadCurrentMeta',
    }),
  },
}
</script>
