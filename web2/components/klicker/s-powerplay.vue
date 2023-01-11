<template>
  <b-select
    :modelValue="(modelValue.powerplay || [])[0]"
    dark
    sm
    @update:modelValue="(v: any) => onInput({ powerplay: v != '' ? [v] : [] })"
  >
    <option value="">{{ $t('option.powerplay.all') }}</option>
    <option value="false">{{ $t('option.powerplay.regular') }}</option>
    <option value="true">{{ $t('option.powerplay.powerleague') }}</option>
  </b-select>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
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
})
</script>
