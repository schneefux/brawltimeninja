<template>
  <card
    v-bind="$attrs"
    dense
  >
    <b-button
      v-if="tooltip != undefined"
      slot="preview"
      class="my-px"
      dark
      xs
      @click="tooltipOpen = !tooltipOpen"
    >?</b-button>
    <template v-slot:content>
      <slot
        v-if="tooltipOpen"
        name="tooltip"
      >
        <p class="text-sm mb-1">
          {{ tooltip }}
        </p>
      </slot>
      <slot name="value">
        <p class="text-center text-3xl font-bold text-yellow-400 mb-2">
          {{ value }}
        </p>
      </slot>
    </template>
    <template
      v-if="'actions' in $scopedSlots"
      v-slot:actions
    >
      <slot name="actions"></slot>
    </template>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  inheritAttrs: false,
  props: {
    value: {
      type: [Number, String],
    },
    label: {
      type: String,
    },
    tooltip: {
      type: String
    },
  },
  data() {
    return {
      tooltipOpen: false,
    }
  },
})
</script>
