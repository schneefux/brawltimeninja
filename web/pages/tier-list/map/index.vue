<template>
  <div class="container mx-auto p-4">
    <div class="section-heading">
      <h1 class="mx-2 text-4xl md:text-center mt-2 font-semibold">
        Map Tier Lists
      </h1>
    </div>

    <p class="md:text-center px-2 mt-4 max-w-lg mx-auto">
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
      data-full-width-responsive
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
          <nuxt-link
            v-for="event in currentEvents"
            :key="event.id"
            :to="`/tier-list/map/${event.id}`"
          >
            <event
              :mode="event.mode.replace(/^Showdown$/, 'Solo Showdown').split(' ').join('')"
              :map="event.map"
              :id="event.id"
            >
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
            </event>
          </nuxt-link>
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
          <nuxt-link
            v-for="event in upcomingEvents"
            :key="event.id"
            :to="`/tier-list/map/${event.id}`"
          >
            <event
              :mode="event.mode.replace(/^Showdown$/, 'Solo Showdown').split(' ').join('')"
              :map="event.map"
              :id="event.id"
            >
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
            </event>
          </nuxt-link>
        </div>
      </details>

      <adsense
        v-if="ads && !isApp"
        id="ezoic-pub-ad-placeholder-111"
        ins-class="h-24 mt-6 text-center"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3577381889"
        data-ad-format="auto"
        data-full-width-responsive
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
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { mapState, mapActions } from 'vuex'
import { formatMode, metaStatMaps, MetaGridEntrySorted } from '../../../lib/util'
import { MapMetaMap } from '../../../model/MetaEntry'
import { ActiveEvent } from '../../../model/Brawlstars'

export default Vue.extend({
  name: 'MetaSelectMapPage',
  data() {
    return {
      load: {},
      formatMode,
      metaStatMaps,
    }
  },
  head() {
    const description = 'Brawl Stars Tier List with Win Rates, Pick Rates and Rankings. Find the best Brawlers for all maps.'
    const formatAsJsonLd = (event: ActiveEvent) => ({
      '@context': 'https://schema.org',
      '@type': 'Event',
      'name': `${formatMode(event.mode)} - ${event.map}`,
      'startDate': event.start,
      'endDate': event.end,
      'eventAttendanceMode': 'https://schema.org/OnlineEventAttendanceMode',
      'eventStatus': 'https://schema.org/EventScheduled',
      'url': `/tier-list/map/${event.id}`,
      'image': [`${process.env.mediaUrl}/tier-list/map/${event.id}.png`],
      'location': {
        '@type': 'VirtualLocation',
        'url': `/tier-list/map/${event.id}`,
      },
      'description': `${event.map} is a Brawl Stars ${formatMode(event.mode)} map.`,
    })
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
