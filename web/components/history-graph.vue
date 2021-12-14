<template>
  <c-query
    :query="{
      cubeId: 'brawler',
      dimensionsIds: ['day'],
      measurementsIds: brawler != undefined ? ['trophies'] : ['playerTrophies'],
      slices: {
        season: [season],
        playerId: [playerId],
        brawler: brawler != undefined ? [brawler.toUpperCase()] : [],
      },
      sortId: 'day',
    }"
  >
    <template v-slot="data">
      <v-line-plot-raw
        v-if="raw"
        v-bind="{ ...data, ...$attrs }"
        full-height
      ></v-line-plot-raw>
      <v-line-plot
        v-else
        v-bind="{ ...data, ...$attrs }"
        full-height
      ></v-line-plot>
    </template>

    <template v-slot:empty>
      <slot name="empty"></slot>
    </template>
    <template v-slot:placeholder>
      <b-card
        v-bind="$attrs"
        full-height
        loading
      >
        <template v-slot:content>
          <slot name="placeholder"></slot>
        </template>
      </b-card>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue from 'vue'
import { formatClickhouse, getSeasonEnd, tagToId } from '~/lib/util'
import { subMonths } from 'date-fns'
import { VLinePlot, VLinePlotRaw } from '~/klicker/components'

export default Vue.extend({
  components: {
    VLinePlot,
    VLinePlotRaw,
  },
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
    playerId() {
      return tagToId(this.playerTag)
    },
  },
})
</script>
