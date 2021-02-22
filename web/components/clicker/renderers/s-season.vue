<template>
  <div class="mr-2 my-1">
    <b-select
      :value="(value.season || [])[0]"
      dark
      sm
      @input="v => $parent.$emit('input', { ...value, season: [v] })"
    >
      <option
        v-for="(label, t) in timeRangeLabel"
        :key="t"
        :value="t"
      >
        {{ label }}
      </option>
    </b-select>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { SliceValue } from '~/lib/cube'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
  },
  computed: {
    timeRangeLabel() {
      return {
        'current': 'Last 2 weeks',
        'month': 'Last 4 weeks',
      }
    },
  }
})
</script>
