<template>
  <range-slider-select
    v-if="'powerGte' in value"
    :value="[(value.powerGte || [0])[0], (value.powerLte || [0])[0]]"
    :min="1"
    :max="10"
    :min-range="0"
    name="Power Level"
    @input="v => onInput({ powerGte: [v[0]], powerLte: [v[1]] })"
  ></range-slider-select>
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
