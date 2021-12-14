<template>
  <trophy-slider-select
    v-if="'trophyRangeGte' in value"
    :value="[(value.trophyRangeGte || [0])[0], (value.trophyRangeLt || [0])[0]]"
    :name="(value.powerplay || [])[0] == 'true' ? 'League' : 'Trophies'"
    @input="v => onInput({ trophyRangeGte: [v[0]], trophyRangeLt: [v[1]] })"
  ></trophy-slider-select>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { SliceValue, SliceValueUpdateListener } from '~/klicker'

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
    onInput: {
      type: Function as PropType<SliceValueUpdateListener>,
      required: true
    },
  },
})
</script>
