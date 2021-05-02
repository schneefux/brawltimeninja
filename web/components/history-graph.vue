<template>
  <c-query
    :state="{
      cubeId: 'brawler',
      dimensionsIds: ['day'],
      measurementsIds: brawler != undefined ? ['trophies'] : ['playerTrophies'],
      slices: {
        season: [season],
        playerTag: [playerTag],
        brawler: brawler != undefined ? [brawler.toUpperCase()] : [],
      },
      sortId: 'day',
    }"
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
    </template>

    <template v-slot:empty>
      <slot name="empty"></slot>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue from 'vue'
import { formatClickhouse, getSeasonEnd } from '~/lib/util'
import { subMonths } from 'date-fns'

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
  computed: {
    season() {
      const d = new Date()
      return formatClickhouse(getSeasonEnd(subMonths(d, 3)))
    },
  },
})
</script>
