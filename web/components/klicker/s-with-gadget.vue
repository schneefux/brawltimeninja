<template>
  <b-select
    :value="(value.gadgetIdNeq || [])[0] == '0' ? '1' : '0'"
    dark
    sm
    @input="v => onInput({ gadgetIdNeq: v == '0' ? [] : ['0'], gadgetIdEq: v == '0' ? ['0'] : [] })"
  >
    <option value="0">0 Gadgets owned</option>
    <option value="1">1 Gadget owned</option>
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
