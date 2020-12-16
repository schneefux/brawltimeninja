<template>
  <page-section
    :title="'Tier List for ' + event.modeName + ' - ' + event.map"
    tracking-id="stats"
    tracking-page-id="map_meta"
  >
    <p slot="description">
      Explore exclusive Brawl Stars Brawler statistics.
    </p>

    <meta-views
      :default-slices="defaultSlices"
      default-cube="map"
    ></meta-views>
  </page-section>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MetaInfo } from 'vue-meta'
import { mapState } from 'vuex'
import { brawlerId, capitalizeWords, deslugify, kebabToCamel, measurementMap, measurementOfTotal, MetaGridEntry } from '~/lib/util'
import { Slices } from '~/plugins/clicker'

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
      link: [ {
        // do not differentiate by query strings (slices)
        rel: 'canonical',
        href: this.$route.path,
      } ],
      meta: [
        { hid: 'description', name: 'description', content: description },
        { hid: 'og:description', property: 'og:description', content: description },
      ]
    }
  },
  middleware: ['cached'],
  props: {
    event: {
      type: Object as PropType<Map>,
      required: true
    },
  },
  computed: {
    defaultSlices() {
      return {
        ...this.$clicker.routeToSlices(this.$route, this.$clicker.defaultSlices('map')),
        battle_event_mode: [ this.event.mode ],
        battle_event_map: [ this.event.map ],
      }
    },
    ...mapState({
      isApp: (state: any) => state.isApp as boolean,
    }),
  },
  scrollToTop: true,
})
</script>
