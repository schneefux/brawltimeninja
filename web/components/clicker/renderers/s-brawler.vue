<template>
  <div
    v-if="'brawler' in value"
    class="mr-2 my-1"
  >
    <b-select
      :value="value.brawler"
      dark
      sm
      @input="v => $parent.$emit('input', { ...value, brawler: v == '' ? [] : [v] })"
    >
      <option
        value=""
      >Any Brawler</option>
      <option
        v-for="b in brawlers"
        :key="b"
        :value="b"
      >{{ capitalize(b.toLowerCase()) }}</option>
    </b-select>
  </div>
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
    const brawlers = await this.$clicker.queryAllBrawlers()
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
