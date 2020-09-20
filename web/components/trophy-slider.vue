<template>
  <div class="flex justify-center align-items-center mt-8">
    <span class="ml-4">Trophies:</span>
    <div class="w-full max-w-xs mx-4">
      <client-only>
        <vue-range-slider
          :min="0"
          :max="10"
          :step="1"
          :min-range="1"
          :value="value"
          @input="e => $emit('input', e)"
          lazy
        >
          <span slot="tooltip" slot-scope="{ value }" class="slider-tooltip">
            {{ Array.isArray(value) ? `${format(value[0])} - ${format(value[1])}` : format(value) }}
          </span>
        </vue-range-slider>
      </client-only>
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
    }
  },
  data() {
    return {
      format(n: number) {
        return n == 10 ? '1000+' : n * 100
      },
      timeout: undefined as undefined|ReturnType<typeof setTimeout>,
    }
  },
})
</script>
