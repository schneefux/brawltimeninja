<template>
  <div
    class="mr-2 my-1"
  >
    <b-select
      :value="(value.withStarpower || [])[0]"
      dark
      sm
      @input="v => $parent.$emit('input', { ...value, withStarpower: [v] })"
    >
      <option value="false">0 Star Powers owned</option>
      <option value="true">1 Star Power owned</option>
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
