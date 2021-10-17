<template>
  <range-slider-select
    v-if="'powerGte' in value"
    :value="[(value.powerGte || [0])[0], (value.powerLte || [0])[0]]"
    :min="1"
    :max="10"
    :min-range="0"
    name="Power Level"
    @input="v => $parent.$emit('slice', { powerGte: [v[0]], powerLte: [v[1]] })"
  ></range-slider-select>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { SliceValue } from '~/klicker'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
  },
})
</script>
