<template>
  <c-query
    :state="{
      cubeId: 'map',
      dimensionsIds: ['brawler'],
      measurementsIds: ['winRateAdj'],
      slices,
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
      <v-roll v-bind="{ ...data, ...$attrs }">
        <template v-slot:dimensions="data">
          <d-brawler v-bind="data"></d-brawler>
        </template>
      </v-roll>
    </template>
  </c-query>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import BrawlerLink from '~/components/brawler/brawler-link.vue'
import DBrawler from '~/components/clicker/renderers/d-brawler.vue'
import { SliceValue } from '~/lib/cube'

export default Vue.extend({
  inheritAttrs: false,
  components: {
    DBrawler,
    BrawlerLink,
  },
  props: {
    slices: {
      type: Object as PropType<SliceValue>,
    },
    limit: {
      type: Number,
      default: 5
    },
  },
})
</script>
