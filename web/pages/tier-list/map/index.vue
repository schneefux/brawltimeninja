<template>
  <div class="page container">
    <div class="section-heading">
      <h1 class="page-h1">Map Tier Lists</h1>
      <p>Click on a map to see the best Brawlers for all current Brawl Stars Events.</p>
    </div>

    <adsense
      v-if="ads"
      id="ezoic-pub-ad-placeholder-110"
      ins-class="h-24 mt-6 text-center"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="8877810024"
      data-ad-format="auto"
      data-full-width-responsive
    />

    <div class="section-heading">
      <h2 class="page-h2">Live Now</h2>
    </div>

    <div class="section flex flex-wrap justify-center">
      <nuxt-link
        v-for="event in currentEvents"
        :key="event.id"
        :to="`/tier-list/map/${event.id}`"
      >
        <event
          :mode="event.mode.replace(/^Showdown$/, 'Solo Showdown').split(' ').join('')"
          :map="event.map"
          :id="event.id"
          infobar
          actions
        >
          <template v-slot:infobar>
            <p class="text-right">
              ends in {{ relativeTimeUntil(event.end) }}
            </p>
          </template>
          <template v-slot:content>
            <div class="brawler-avatars my-4">
              <div
                v-for="brawler in bestByEvent[event.id].slice(0, 5)"
                :key="brawler.id"
                class="brawler-avatars__element"
              >
                <div class="brawler-avatar">
                  <media-img
                    :path="`/brawlers/${brawler.id}/avatar`"
                    size="160"
                    clazz="brawler-avatar__img"
                  />
                  <p class="brawler-avatar__stats">
                    {{ metaStatMaps.formatters[brawler.sortProp](brawler.stats[brawler.sortProp]) }}
                    {{ metaStatMaps.labelsShort[brawler.sortProp] }}
                  </p>
                </div>
              </div>
            </div>
          </template>
          <template v-slot:actions>
            <div class="flex justify-end">
              <nuxt-link
                :to="`/tier-list/map/${event.id}`"
                class="button button-md"
              >
                Open
              </nuxt-link>
            </div>
          </template>
        </event>
      </nuxt-link>
    </div>

    <div class="section-heading">
      <h2 class="page-h2">Upcoming Events</h2>
    </div>

    <div class="section flex flex-wrap justify-center">
      <nuxt-link
        v-for="event in upcomingEvents"
        :key="event.id"
        :to="`/tier-list/map/${event.id}`"
      >
        <event
          :mode="event.mode.replace(/^Showdown$/, 'Solo Showdown').split(' ').join('')"
          :map="event.map"
          :id="event.id"
          infobar
          actions
        >
          <template v-slot:infobar>
            <p class="text-right">
              starts in {{ relativeTimeUntil(event.start) }}
            </p>
          </template>
          <template v-slot:content>
            <div class="brawler-avatars my-4">
              <div
                v-for="brawler in bestByEvent[event.id].slice(0, 5)"
                :key="brawler.id"
                class="brawler-avatars__element"
              >
                <div class="brawler-avatar">
                  <media-img
                    :path="`/brawlers/${brawler.id}/avatar`"
                    size="160"
                    clazz="brawler-avatar__img"
                  />
                  <p class="brawler-avatar__stats">
                    {{ metaStatMaps.formatters[brawler.sortProp](brawler.stats[brawler.sortProp]) }}
                    {{ metaStatMaps.labelsShort[brawler.sortProp] }}
                  </p>
                </div>
              </div>
            </div>
          </template>
          <template v-slot:actions>
            <div class="flex justify-end">
              <nuxt-link
                :to="`/tier-list/map/${event.id}`"
                class="button button-md"
              >
                Open
              </nuxt-link>
            </div>
          </template>
        </event>
      </nuxt-link>
    </div>

    <adsense
      v-if="ads && !isApp"
      id="ezoic-pub-ad-placeholder-111"
      ins-class="h-24 mt-6 text-center"
      data-ad-client="ca-pub-6856963757796636"
      data-ad-slot="3577381889"
      data-ad-format="auto"
      data-full-width-responsive
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState, mapActions } from 'vuex'
import { formatMode, metaStatMaps, MetaGridEntrySorted, relativeTimeUntil, formatAsJsonLd } from '../../../lib/util'
import { MapMetaMap } from '../../../model/MetaEntry'
import { ActiveEvent } from '../../../model/Brawlstars'

export default Vue.extend({
  name: 'MetaSelectMapPage',
  data() {
    return {
      formatMode,
      metaStatMaps,
      relativeTimeUntil,
    }
  },
  head() {
    const description = 'Brawl Stars Tier List with Win Rates, Pick Rates and Rankings. Find the best Brawlers for all maps.'
    const structuredData = this.currentEvents.concat(this.upcomingEvents)
      .map((event) => ({
        type: 'application/ld+json',
        innerHTML: JSON.stringify(formatAsJsonLd(event)),
      }))

    return {
      title: 'Map Tier List',
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ],
      __dangerouslyDisableSanitizers: ['script'],
      script: structuredData,
    }
  },
  computed: {
    events(): { [mode: string]: { id: string, mode: string, map: string } } {
      return [...Object.entries(this.mapMeta as MapMetaMap)]
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
      currentEvents: (state: any) => state.currentEvents as ActiveEvent[],
      upcomingEvents: (state: any) => state.upcomingEvents as ActiveEvent[],
      bestByEvent: (state: any) => state.bestByEvent as { [key: string]: MetaGridEntrySorted[] },
      mapMeta: (state: any) => state.mapMeta as MapMetaMap,
      ads: (state: any) => state.adsEnabled as boolean,
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  async fetch({ store }) {
    if (!(<any>process).static) {
      await Promise.all([
        store.dispatch('loadCurrentEvents'),
        store.dispatch('loadUpcomingEvents'),
        store.dispatch('loadMapMeta'),
      ])
    }
  },
  async created() {
    if ((<any>process).static) {
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
})
</script>
