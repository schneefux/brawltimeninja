<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">Map Tier Lists</h1>
      <p>Open on a map to see the best Brawlers for all current and upcoming Brawl Stars Events.</p>
    </div>

    <client-only>
      <adsense
        id="ezoic-pub-ad-placeholder-110"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="8877810024"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'current_events'),
        once: true,
      }"
    >
      <h2 class="page-h2">Live Now</h2>
    </div>

    <div class="section flex flex-wrap justify-center">
      <active-events eager></active-events>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="4150756245"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'upcoming_events'),
        once: true,
      }"
    >
      <h2 class="page-h2">Upcoming Events</h2>
    </div>

    <div class="section flex flex-wrap justify-center">
      <lazy-map-best-brawlers-card
        v-for="event in upcomingEvents"
        :key="event.id"
        :id="event.id"
        :mode="unformatMode(event.mode)"
        :map="event.map"
        :start-date="event.start"
        link
      ></lazy-map-best-brawlers-card>
    </div>

    <client-only>
      <adsense
        v-if="!isApp"
        id="ezoic-pub-ad-placeholder-111"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3577381889"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaInfo } from 'vue-meta'
import { formatAsJsonLd, unformatMode } from '../../../lib/util'
import { CurrentAndUpcomingEvents, ActiveEvent } from '../../../model/Api'

export default Vue.extend({
  data() {
    return {
      currentEvents: [] as ActiveEvent[],
      upcomingEvents: [] as ActiveEvent[],
      unformatMode,
    }
  },
  head(): MetaInfo {
    const description = 'Brawl Stars Tier List with Win Rates, Pick Rates and Rankings. Find the best Brawlers for all maps.'
    const structuredData = this.currentEvents.concat(this.upcomingEvents)
      .map((event) => ({
        type: 'application/ld+json',
        json: formatAsJsonLd(event),
      }))

    return {
      title: 'Map Tier List',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ],
      script: structuredData,
    }
  },
  computed: {
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async asyncData({ $axios }) {
    const events = await $axios.$get<CurrentAndUpcomingEvents>('/api/events/active')
    return {
      currentEvents: events.current,
      upcomingEvents: events.upcoming,
    }
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible) {
        this.$ga.event('maps', 'scroll', section)
      }
    },
  },
})
</script>
