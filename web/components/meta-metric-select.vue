<template>
  <card v-bind="$attrs">
    <div
      slot="content"
      class="flex flex-wrap"
    >
      <div class="w-14 flex-shrink-0 my-1">
        <span>Metric</span>
      </div>
      <div class="flex flex-wrap">
        <b-button
          v-for="m in measurements"
          :key="m"
          :selected="value == m"
          class="mr-2 mb-1"
          dark
          sm
          @click="$emit('input', m)"
        >
          {{ metaStatMaps.labels[m] }}
        </b-button>
      </div>

      <p class="w-full mt-2">
        {{ metaStatMaps.descriptions[value] }}
      </p>
    </div>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { metaStatMaps } from '~/lib/util'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      required: true
    },
    measurements: {
      type: Array as PropType<string[]>,
      required: true
    },
  },
  computed: {
    metaStatMaps() {
      return metaStatMaps
    },
  },
})
</script>
