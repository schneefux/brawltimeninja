<template>
  <b-select
    :value="(value.starpowerIdNeq || ['0'])[0] == '0' ? '1' : '0'"
    dark
    sm
    @input="v => onInput({ starpowerIdNeq: v == '0' ? [] : ['0'], starpowerIdEq: v == '0' ? ['0'] : [] })"
  >
    <option value="0">{{ $t('filter.starpowers.0') }}</option>
    <option value="1">{{ $t('filter.starpowers.1') }}</option>
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
