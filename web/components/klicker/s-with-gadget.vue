<template>
  <b-select
    v-model="value"
    dark
    sm
  >
    <option value="0">{{ $t('filter.gadgets.0') }}</option>
    <option value="1">{{ $t('filter.gadgets.1') }}</option>
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
        return (props.modelValue.gadgetIdNeq || [])[0] == '0' ? '1' : '0'
      },
      set(v: string) {
        props.onInput({ gadgetIdNeq: v == '0' ? [] : ['0'], gadgetIdEq: v == '0' ? ['0'] : [] })
      }
    })

    return {
      value,
    }
  },
})
</script>
