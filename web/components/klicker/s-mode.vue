<template>
  <b-select
    v-if="modes != undefined"
    v-model="mode"
    dark
    sm
  >
    <option value="">{{ $t('option.any-mode') }}</option>
    <option
      v-for="m in modes"
      :key="m"
      :value="m"
    >{{ $t('mode.' + m) }}</option>
  </b-select>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { SliceValue, SliceValueUpdateListener } from '@schneefux/klicker/types'
import { useAllModes } from '~/composables/dimension-values'

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
    const modes = useAllModes()
    const mode = computed({
      get() {
        return (props.modelValue.mode ?? [])[0] ?? ''
      },
      set(v: string) {
        props.onInput({ mode: v == '' ? [] : [v] })
      }
    })

    return {
      mode,
      modes,
    }
  },
})
</script>
