<template>
  <b-select
    :value="(value.powerplay || [])[0]"
    dark
    sm
    @input="v => onInput({ powerplay: v != '' ? [v] : [] })"
  >
    <option value="">{{ $t('option.powerplay.all') }}</option>
    <option value="false">{{ $t('option.powerplay.regular') }}</option>
    <option value="true">{{ $t('option.powerplay.powerleague') }}</option>
  </b-select>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
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
