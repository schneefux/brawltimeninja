<template>
  <div
    v-if="'season' in value"
    class="mr-2 my-1"
  >
    <b-select
      :value="value.season[0]"
      dark
      sm
      @input="v => $parent.$emit('slice', { season: [v] })"
    >
      <option
        v-for="s in seasons"
        :key="s.id"
        :value="s.id"
      >
        Since {{ s.name }}
      </option>
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
  data() {
    return {
      seasons: [] as { id: string, name: string }[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    this.seasons = await this.$cube.queryAllSeasons(8)
  },
})
</script>
