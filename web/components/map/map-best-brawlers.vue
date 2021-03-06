<template>
  <c-query
    :state="{
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      measurementsIds: ['winRateAdj'],
      slices: {
        map: map != undefined ? [map] : [],
        mode: mode != undefined ? [mode] : [],
        powerplay: powerplay != undefined ? [powerplay] : [],
        season: season != undefined ? [season] : [],
      },
      sortId: 'winRateAdj',
    }"
    :limit="limit"
  >
    <shimmer
      slot="placeholder"
      width-px="265"
      height-px="72"
      loading
    ></shimmer>
    <template v-slot="data">
      <v-roll
        v-bind="{ ...data, ...$attrs }"
      >
        <template v-slot:dimensions="data">
          <d-brawler v-bind="data"></d-brawler>
        </template>
      </v-roll>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue from 'vue'
import BrawlerLink from '~/components/brawler/brawler-link.vue'
import DBrawler from '~/components/clicker/renderers/d-brawler.vue'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    map: {
      type: String,
    },
    mode: {
      type: String,
    },
    season: {
      type: String,
    },
    powerplay: {
      type: Boolean,
    },
    limit: {
      type: Number,
      default: 5
    },
  },
  components: {
    DBrawler,
    BrawlerLink,
  },
})
</script>
