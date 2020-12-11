<template>
  <page :title="modeName">
    <p>Use the <span class="text-primary-lighter">{{ modeName }}</span> Tier List to find the best Brawler for all {{ modeName }} maps in Brawl Stars.</p>

    <page-section
      tracking-id="description"
      tracking-page-id="mode_meta"
    >
      <mode-article-card
        :mode="mode"
        class="mx-auto"
      ></mode-article-card>
    </page-section>

    <client-only>
      <adsense
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="2291234880"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>

    <page-section
      tracking-id="widget"
      tracking-page-id="mode_meta"
    >
      <map-detail-card
        :mode="mode"
        :timestamp="totalTimestamp"
        class="mx-auto"
      ></map-detail-card>
    </page-section>

    <page-section
      title="Map Tier Lists"
      tracking-id="maps"
      tracking-page-id="mode_meta"
    >
      <p slot="description">Open on a Map to view the Tier List for it.</p>

      <horizontal-scroller expand-on-desktop>
        <lazy
          v-for="(map, index) in maps"
          :key="map.map"
          :render="showAllMaps || index <= 1"
          distance="600px"
        >
          <div
            class="w-64"
            style="height: 396px"
            slot="placeholder"
            :class="['mx-2', {
              'md:hidden': !showAllMaps && index > 0,
            }]"
          ></div>
          <event-card
            :mode="mode"
            :map="map.map"
            nobackground
            :class="['mx-2', {
              'md:hidden': !showAllMaps && index > 0,
            }]"
            size="w-64"
          >
            <template v-slot:content>
              <media-img
                :path="`/maps/${map.id}`"
                size="512"
                clazz="mx-auto h-64"
              ></media-img>
            </template>
            <b-button
              slot="actions"
              tag="router-link"
              :to="`/tier-list/mode/${camelToKebab(mode)}/map/${slugify(map.map)}`"
              secondary
            >
              Open
            </b-button>
          </event-card>
        </lazy>
      </horizontal-scroller>

      <div class="mt-2 w-full text-right hidden md:block">
        <button
          v-show="!showAllMaps"
          class="button button--md button--secondary"
          @click="expandMaps()"
        >
          Show All {{ modeName }} Maps
        </button>
      </div>
    </page-section>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="2263314723"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>

    <page-section
      :title="'Tier List for all ' + modeName + ' Maps'"
      tracking-id="stats"
      tracking-page-id="mode_meta"
    >
      <meta-slicers
        v-model="slices"
        :sample="totalSampleSize"
        :sample-min="300000"
        :timestamp="totalTimestamp"
        :loading="$fetchState.pending"
        cube="map"
        class="mx-auto"
      ></meta-slicers>

      <meta-views
        v-if="totalSampleSize > 0"
        :entries="entries"
        :measurements="measurements"
        :description="description"
        @measurements="ms => selectedMeasurements = ms"
        ga-category="mode_meta"
      ></meta-views>
    </page-section>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="8497550588"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </page>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import pageSection from '~/components/page-section.vue'
import { formatMode, MetaGridEntry, brawlerId, measurementMap, capitalizeWords, measurementOfTotal, kebabToCamel } from '~/lib/util'
import { camelToKebab, slugify } from '../../../../lib/util'

interface EventIdAndMap {
  id: number
  map: string
}

export default Vue.extend({
  head() {
    const description = `Brawl Stars ${(<any>this).modeName} Tier List. Find the best Brawlers for ${(<any>this).modeName} with Win Rates and Rankings.`
    return {
      title: `${(<any>this).modeName} Tier List`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  middleware: ['cached'],
  data() {
    return {
      slices: this.$clicker.defaultSlices('map'),
      showAllMaps: false,
      mode: '',
      modeName: '',
      maps: [] as EventIdAndMap[],
      entries: [] as MetaGridEntry[],
      selectedMeasurements: ['winRateAdj'],
      totalSampleSize: 0,
      totalTimestamp: undefined as string|undefined,
    }
  },
  watch: {
    slices: '$fetch',
    selectedMeasurements: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('meta.mode', 'map',
      ['brawler_name'],
      [...this.selectedMeasurements.map(m => measurementMap[m]), 'picks', 'timestamp'],
      this.slices,
      { sort: { picks: 'desc' }, cache: 60*30 })

    this.entries = data.data.map(row => ({
      id: row.brawler_name,
      brawler: row.brawler_name,
      title: capitalizeWords(row.brawler_name.toLowerCase()),
      stats: this.selectedMeasurements.reduce((stats, m) => ({
        ...stats,
        [m]: row[measurementMap[m]] / (measurementOfTotal[m] ? data.totals[measurementMap[m]] : 1),
      }), {} as Record<string, number>),
      sampleSize: row.picks,
      link: `/tier-list/brawler/${brawlerId({ name: row.brawler_name })}`,
    }) as MetaGridEntry)
    this.totalSampleSize = data.totals.picks
    this.totalTimestamp = data.totals.timestamp
  },
  async asyncData({ params, $clicker }) {
    const mode = kebabToCamel(params.mode as string)
    const modeName = formatMode(mode)
    const events = await $clicker.query('all.events', 'map',
      ['battle_event_id', 'battle_event_map'],
      ['battle_event_id', 'battle_event_map', 'picks', 'timestamp'],
      { battle_event_mode: [mode] },
      {
        sort: { timestamp: 'desc' },
        cache: 60*60,
      })

    return {
      mode,
      modeName,
      maps: events.data
        .filter(e => e.picks > 1000)
        .map(e => ({
          id: e.battle_event_id,
          map: e.battle_event_map,
          timestamp: e.timestamp,
        })),
      slices: {
        ...$clicker.defaultSlices('map'),
        battle_event_mode: [mode],
      } as any,
    }
  },
  computed: {
    measurements(): string[] {
      let measurements = ['wins', 'winRate', 'useRate', 'pickRate']
      // all 3v3: star player
      if (['gemGrab', 'heist', 'bounty', 'hotZone', 'brawlBall', 'siege'].includes(this.mode)) {
        measurements = [...measurements, 'starRate']
      }
      // all 3v3 except bounty: duration
      if (['gemGrab', 'heist', 'hotZone', 'brawlBall', 'siege'].includes(this.mode)) {
        measurements = [...measurements, 'duration']
      }
      if (this.mode.endsWith('howdown')) {
        measurements = [...measurements, 'rank1Rate']
      }
      return measurements
    },
    description(): string {
      return this.$clicker.describeSlices(this.slices, this.totalTimestamp)
    },
    camelToKebab() {
      return camelToKebab
    },
    slugify() {
      return slugify
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  methods: {
    expandMaps() {
      this.showAllMaps = true
      this.$gtag.event('load_more', {
        'event_category': 'meta_mode',
      })
    },
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'mode_meta',
          'event_label': section,
        })
      }
    },
  },
})
</script>
