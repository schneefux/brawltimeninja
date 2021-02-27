<template>
  <c-query
    :config="config"
    :state="{
      cubeId: 'brawler',
      dimensionsIds: ['day'],
      measurementsIds: brawler != undefined ? ['trophies'] : ['playerTrophies'],
      slices: {
        season: ['month'],
        playerTag: [playerTag],
        brawler: brawler != undefined ? [brawler.toUpperCase()] : [],
      },
      sortId: 'day',
    }"
    ignore-meta
  >
    <template v-slot="data">
      <v-lineplot-raw
        v-if="raw"
        v-bind="{ ...data, ...$attrs }"
        full-height
      ></v-lineplot-raw>
      <v-lineplot
        v-else
        v-bind="{ ...data, ...$attrs }"
        full-height
      ></v-lineplot>
    </template
  ></c-query>
</template>

<script lang="ts">
import Vue from 'vue'
import config from '~/lib/cube'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    brawler: {
      type: String,
    },
    playerTag: {
      type: String,
      required: true
    },
    raw: {
      type: Boolean
    },
  },
  data() {
    return {
      config,
    }
  },
})
</script>
