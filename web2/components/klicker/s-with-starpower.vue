<template>
  <b-select
    v-model="value"
    dark
    sm
  >
    <option value="0">{{ $t('filter.starpowers.0') }}</option>
    <option value="1">{{ $t('filter.starpowers.1') }}</option>
  </b-select>
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
        return (props.modelValue.starpowerIdNeq || ['0'])[0] == '0' ? '1' : '0'
      },
      set(v: string) {
        props.onInput({ starpowerIdNeq: v == '0' ? [] : ['0'], starpowerIdEq: v == '0' ? ['0'] : [] })
      }
    })

    return {
      value,
    }
  }
})
</script>
