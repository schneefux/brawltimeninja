<template>
  <range-slider-select
    v-model="value"
    :min="0"
    :max="11"
    :min-range="0"
    name="Power Level"
  ></range-slider-select>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<SliceValue>,
      required: true
    },
    onInput: {
      type: Function as PropType<SliceValueUpdateListener>,
      required: true
    },
  },
  setup(props) {
    const value = computed({
      get() {
        return [parseInt((props.modelValue.powerGte || [])[0] ?? '0'), parseInt((props.modelValue.powerLte || [])[0] || '11')]
      },
      set(v: number[]) {
        props.onInput({ powerGte: v[0] != 0 ? [`${v[0]}`] : [], powerLte: v[1] != 11 ? [`${v[1]}`] : [] })
      }
    })

    return {
      value,
    }
  },
})
</script>
