<template>
  <b-select
    v-if="'ally' in value"
    :value="value.ally"
    dark
    sm
    @input="v => $parent.$emit('slice', { ally: v == '' ? [] : [v] })"
  >
    <option
      value=""
    >with any</option>
    <option
      v-for="b in brawlers"
      :key="b"
      :value="b"
    >with {{ capitalize(b.toLowerCase()) }}</option>
  </b-select>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { SliceValue } from '~/lib/cube'
import { capitalize } from '~/lib/util'

export default Vue.extend({
  props: {
    value: {
      type: Object as PropType<SliceValue>,
      required: true
    },
  },
  data() {
    return {
      brawlers: [] as string[],
    }
  },
  async fetch() {
    const brawlers = await this.$cube.queryAllBrawlers()
    this.brawlers = brawlers
      .sort((b1, b2) => b1.localeCompare(b2))
  },
  computed: {
    capitalize() {
      return capitalize
    },
  },
})
</script>
