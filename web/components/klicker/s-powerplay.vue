<template>
  <b-select
    v-if="'powerplay' in value"
    :value="(value.powerplay || [])[0]"
    dark
    sm
    @input="v => onInput({ powerplay: v != '' ? [v] : [] })"
  >
    <option value="">All Battles</option>
    <option value="false">Regular Battles</option>
    <option value="true">Power League</option>
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
