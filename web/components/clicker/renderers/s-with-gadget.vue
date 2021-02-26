<template>
  <div
    v-if="'withGadget' in value"
    class="mr-2 my-1"
  >
    <b-select
      :value="(value.withGadget || [])[0]"
      dark
      sm
      @input="v => $parent.$emit('slice', { withGadget: [v] })"
    >
      <option value="false">0 Gadgets owned</option>
      <option value="true">1 Gadget owned</option>
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
