<template>
  <b-select
    v-if="'season' in value && seasons.length > 0"
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
  data() {
    return {
      seasons: [] as { id: string, name: string }[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    this.seasons = await this.$klicker.queryAllSeasons(8)
  },
})
</script>
