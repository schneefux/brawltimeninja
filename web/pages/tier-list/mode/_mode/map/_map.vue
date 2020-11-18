<template>
  <div class="page container">
    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'title'),
        once: true,
      }"
    >
      <h1 class="page-h1">{{ event.modeName }}: {{ event.map }}</h1>
      <p>Use the <span class="text-primary-lighter">{{ event.map }}</span> Tier List to find the best Brawler for this {{ event.modeName }} map in Brawl Stars.</p>
    </div>

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

    <div
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'widget'),
        once: true,
      }"
      class="section flex justify-center"
    >
      <map-detail-card
        :mode="event.mode"
        :map="event.map"
        :id="event.id"
        :timestamp="event.timestamp"
      ></map-detail-card>
    </div>

    <div
      v-if="event.mode != 'soloShowdown'"
      class="section flex justify-center"
    >
      <div class="card card__content card--dark max-w-sm w-full flex justify-center">
        <nuxt-link
          :to="`/tier-list/mode/${camelToKebab(event.mode)}/map/${slugify(event.map)}`"
          class="button mx-2 button--md"
          active-class="button--selected"
          exact
        >Best Brawlers</nuxt-link>
        <nuxt-link
          :to="`/tier-list/mode/${camelToKebab(event.mode)}/map/${slugify(event.map)}/teams`"
          class="button mx-2 button--md"
          active-class="button--selected"
        >Best Teams</nuxt-link>
      </div>
    </div>

    <nuxt-child
      :event="event"
    ></nuxt-child>

    <div
      class="section-heading"
      v-observe-visibility="{
        callback: (v, e) => trackScroll(v, e, 'maps'),
        once: true,
      }"
    >
      <h2 class="page-h2">{{ event.modeName }} Tier List</h2>
      <p>Compare the {{ event.map }} Tier List with the overall {{ event.modeName }} Tier List.</p>
    </div>

    <div class="section flex justify-center">
      <map-best-brawlers-card
        :mode="event.mode"
        link
      ></map-best-brawlers-card>
    </div>

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
  </div>
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
        this.$ga.event('map_meta', 'scroll', section)
      }
    },
  },
})
</script>
