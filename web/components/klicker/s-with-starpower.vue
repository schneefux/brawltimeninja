<template>
  <b-select
    v-if="'starpowerIdNeq' in value"
    :value="(value.starpowerIdNeq || ['0'])[0] == '0' ? '1' : '0'"
    dark
    sm
    @input="v => onInput({ starpowerIdNeq: v == '0' ? [] : ['0'], starpowerIdEq: v == '0' ? ['0'] : [] })"
  >
    <option value="0">0 Star Powers owned</option>
    <option value="1">1 Star Power owned</option>
  </b-select>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { SliceValue, SliceValueUpdateListener } from '~/klicker'

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
