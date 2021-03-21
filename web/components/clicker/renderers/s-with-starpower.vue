<template>
  <div
    v-if="'starpowerIdNeq' in value"
    class="mr-2 my-1"
  >
    <b-select
      :value="(value.starpowerIdNeq || [])[0] == '0' ? '1' : '0'"
      dark
      sm
      @input="v => $parent.$emit('slice', { starpowerIdNeq: v == '0' ? [] : ['0'], starpowerIdEq: v == '0' ? ['0'] : [] })"
    >
      <option value="0">0 Star Powers owned</option>
      <option value="1">1 Star Power owned</option>
    </b-select>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { SliceValue } from '~/lib/cube'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
  },
})
</script>
