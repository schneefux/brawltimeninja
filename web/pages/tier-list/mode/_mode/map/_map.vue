<template>
  <page :title="event.modeName + ': ' + event.map">
    <p>Use the <span class="text-primary-lighter">{{ event.map }}</span> Tier List to find the best Brawler for this {{ event.modeName }} map in Brawl Stars.</p>
    <p v-if="event.map.startsWith('Competition Winner')">
      A new Competition Winner Map is voted by the community every day.
      <nuxt-link
        to="/tier-list/competition-winners"
        class="link"
      >Compare them here.</nuxt-link>
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

    <div class="section flex flex-wrap justify-center items-center">
      <map-detail-card
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'widget'),
          once: true,
        }"
        :mode="event.mode"
        :map="event.map"
        :id="event.id"
        :timestamp="event.timestamp"
      ></map-detail-card>

      <map-leaderboard-card
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'leaderboard'),
          once: true,
        }"
        :mode="event.mode"
        :map="event.map"
        :id="event.id"
        :timestamp="event.timestamp"
      ></map-leaderboard-card>
    </div>

    <div class="flex justify-center">
      <card
        v-if="event.mode != 'soloShowdown'"
        class="mx-auto"
        md
      >
        <div slot="content" class="flex justify-center">
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
      </card>
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
  </page>
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
