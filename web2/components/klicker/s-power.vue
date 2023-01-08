<template>
  <range-slider-select
    :value="[(value.powerGte || [])[0] || 0, (value.powerLte || [])[0] || 11]"
    :min="0"
    :max="11"
    :min-range="0"
    name="Power Level"
    @input="v => onInput({ powerGte: v[0] != 0 ? [v[0]] : [], powerLte: v[1] != 11 ? [v[1]] : [] })"
  ></range-slider-select>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'

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
