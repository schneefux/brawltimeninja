<template>
  <b-select
    v-if="'powerplay' in value"
    :value="(value.powerplay || [])[0]"
    dark
    sm
    @input="v => $parent.$emit('slice', { powerplay: v != '' ? [v] : [] })"
  >
    <option value="">All Battles</option>
    <option value="false">Regular Battles</option>
    <option value="true">Power League</option>
  </b-select>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { SliceValue } from '~/klicker'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
  },
})
</script>
