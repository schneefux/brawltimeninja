<template>
  <div class="flex items-center mt-4">
    <div class="w-20 flex-shrink-0">
      <span>{{ name }}</span>
    </div>
    <div class="flex w-full">
      <div class="w-full mr-4 mt-6">
        <client-only>
          <vue-range-slider
            :min="0"
            :max="10"
            :step="1"
            :min-range="1"
            :value="value"
            @input="e => $emit('input', e)"
            tooltip-dir="top"
            lazy
          >
            <span slot="tooltip" slot-scope="{ value }" class="slider-tooltip">
              {{ Array.isArray(value) ? `${format(value[0])} - ${format(value[1])}` : format(value) }}
            </span>
          </vue-range-slider>
        </client-only>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
  props: {
    value: {
      type: Array as PropType<number[]>,
      required: true,
    },
    name: {
      type: String,
      default: 'Trophies'
    },
  },
  data() {
    return {
      format(n: number) {
        return n == 10 ? '1000+' : n * 100
      },
    }
  },
})
</script>
