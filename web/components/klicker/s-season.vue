<template>
  <b-select
    v-if="key in value && seasons.length > 0"
    :value="value[key][0]"
    dark
    sm
    @input="v => $parent.$emit('slice', { [key]: [v] })"
  >
    <option
      v-for="s in seasons"
      :key="s.id"
      :value="s.id"
    >
      {{ exact ? 'At' : 'Since' }} {{ s.name }}
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
    exact: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 8
    },
  },
  data() {
    return {
      seasons: [] as { id: string, name: string }[],
    }
  },
  fetchDelay: 0,
  async fetch() {
    this.seasons = await this.$klicker.queryAllSeasons(this.limit)
  },
  watch: {
    limit: '$fetch',
  },
  computed: {
    key(): string {
      if (this.exact != false) {
        return 'seasonExact'
      } else {
        return 'season'
      }
    },
  },
})
</script>
