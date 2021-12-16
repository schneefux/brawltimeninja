<template>
  <trophy-slider-select
    v-if="'trophyRangeGte' in value || 'trophyRangeLt' in value"
    :value="{ gte: (value.trophyRangeGte || [])[0], lt: (value.trophyRangeLt || [])[0] }"
    :name="(value.powerplay || [])[0] == 'true' ? 'League' : 'Trophies'"
    @input="v => onInput({ trophyRangeGte: v.gte != undefined ? [v.gte] : [], trophyRangeLt: v.lt != undefined ? [v.lt] : [] })"
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
