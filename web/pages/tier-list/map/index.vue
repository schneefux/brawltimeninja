<template>
  <page :title="$t('tier-list.maps.title')">
    <p>{{ $t('tier-list.maps.description') }}</p>

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

    <page-section
      :title="$t('tier-list.modes.title')"
      tracking-id="modes"
      tracking-page-id="maps"
    >
      <p slot="description">{{ $t('tier-list.modes.description') }}</p>
      <modes-cards></modes-cards>
    </page-section>

    <page-section
      :title="$t('events.active.title')"
      tracking-id="current_events"
      tracking-page-id="maps"
    >
      <active-events eager></active-events>
    </page-section>

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

    <page-section
      :title="$t('events.upcoming.title')"
      tracking-id="upcoming_events"
      tracking-page-id="maps"
    >
      <div class="flex flex-wrap justify-center">
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
    </page-section>

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
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaInfo } from 'vue-meta'
import { formatAsJsonLd, unformatMode } from '@/lib/util'
import { CurrentAndUpcomingEvents, ActiveEvent } from '@/model/Api'

export default Vue.extend({
  data() {
    return {
      currentEvents: [] as ActiveEvent[],
      upcomingEvents: [] as ActiveEvent[],
      unformatMode,
    }
  },
  head(): MetaInfo {
    const description = this.$tc('tier-list.maps.meta.description', 1)
    const structuredData = this.currentEvents.concat(this.upcomingEvents)
      .map((event) => ({
        type: 'application/ld+json',
        json: formatAsJsonLd({
          id: event.id,
          map: event.map,
          mode: event.mode,
          start: event.start,
          end: event.end,
        }),
      }))

    return {
      title: this.$tc('tier-list.maps.meta.title', 1),
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ],
      script: structuredData,
    }
  },
  meta: {
    title: 'Events',
    screen: 'events',
  },
  middleware: ['cached'],
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
        this.$gtag.event('scroll', {
          'event_category': 'maps',
          'event_label': section,
        })
      }
    },
  },
})
</script>
