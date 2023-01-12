<template>
  <b-select
    v-model="value"
    dark
    sm
  >
    <option value="">{{ $t('option.powerplay.all') }}</option>
    <option value="false">{{ $t('option.powerplay.regular') }}</option>
    <option value="true">{{ $t('option.powerplay.powerleague') }}</option>
  </b-select>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
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
        return (props.modelValue.powerplay || [])[0] ?? ''
      },
      set(v: string) {
        props.onInput({ powerplay: v != '' ? [v] : [] })
      }
    })

    return {
      value,
    }
  },
})
</script>
