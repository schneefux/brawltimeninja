<template>
  <trophy-slider-select
    v-if="'trophyRangeGte' in value"
    :value="[(value.trophyRangeGte || [0])[0], (value.trophyRangeLt || [0])[0]]"
    :name="(value.powerplay || [])[0] == 'true' ? 'League' : 'Trophies'"
    class="mr-2 my-1"
    @input="v => $parent.$emit('slice', { trophyRangeGte: [v[0]], trophyRangeLt: [v[1]] })"
  ></trophy-slider-select>
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
})
</script>
