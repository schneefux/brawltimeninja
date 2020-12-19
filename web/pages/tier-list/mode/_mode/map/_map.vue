<template>
  <page-dashboard
    :title="title"
  >
    <p>Use the {{ event.map }} Tier List to find the best Brawler for this {{ event.modeName }} map in Brawl Stars.</p>
    <p v-if="event.map.startsWith('Competition Winner')">
      A new Competition Winner Map is voted by the community every day.
      <b-button
        to="/tier-list/competition-winners"
        prefetch
        primary
        xs
      >Compare Competition Winners</b-button>
    </p>

    <client-only>
      <adsense
        ins-class="ad-section"
        id="ezoic-pub-ad-placeholder-112"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="1665534416"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>

    <page-section>
      <map-views
        :mode="event.mode"
        :map="event.map"
        :id="event.id"
        :timestamp="event.timestamp"
        ga-category="map"
      ></map-views>
    </page-section>

    <page-section>
      <map-best-brawlers-card
        :mode="event.mode"
        class="mx-auto"
        md
        link
      ></map-best-brawlers-card>
    </page-section>

    <client-only>
      <adsense
        v-if="!isApp"
        ins-class="ad-section"
        data-ad-client="ca-pub-6856963757796636"
        data-ad-slot="3536131238"
        data-ad-format="auto"
        data-full-width-responsive="yes"
      />
    </client-only>
  </page-dashboard>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import { mapState } from 'vuex'
import { deslugify, kebabToCamel, formatMode, camelToKebab, slugify } from '~/lib/util'

interface Map {
  id: string
  mode: string
  modeName: string
  map: string
}

export default Vue.extend({
  head(): MetaInfo {
    const description = `Brawl Stars Tier List for ${this.event.modeName}: ${this.event.map}. View the best Brawlers with Win Rates and Rankings.`
    return {
      title: `Tier List for ${this.event.modeName}: ${this.event.map}`,
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  middleware: ['cached'],
  data() {
    return {
      event: {
        id: '',
        mode: '',
        modeName: '',
        map: '',
      } as Map,
    }
  },
  computed: {
    title(): string {
      return `${this.event.modeName}: ${this.event.map} Brawl Stars Tier List`
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
  async asyncData({ store, params, error, $clicker }) {
    const mode = kebabToCamel(params.mode)
    const map = deslugify(params.map)
    const events = await $clicker.query('all.events', 'map',
      ['battle_event_id', 'battle_event_mode', 'battle_event_map'],
      ['battle_event_id', 'battle_event_mode', 'battle_event_map', 'timestamp'],
      {
        battle_event_mode: [mode],
        battle_event_map: [map],
      },
      { cache: 60*10 })
    if (events.data.length == 0) {
      return error({ statusCode: 404, message: 'Map not found' })
    }
    const event = events.data[0]

    return {
      event: {
        id: event.battle_event_id,
        map,
        mode,
        modeName: formatMode(mode),
        timestamp: event.timestamp,
      } as Map,
    }
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string) {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'map_meta',
          'event_label': section,
        })
      }
    },
  },
})
</script>
