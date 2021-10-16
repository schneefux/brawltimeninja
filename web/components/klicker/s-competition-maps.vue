<template>
  <b-select
    v-if="'mapLike' in value && 'mapNotLike' in value"
    v-model="choice"
    dark
    sm
  >
    <option value="all">Include Competition Maps</option>
    <option value="include">Only Competition Maps</option>
    <option value="exclude">Exclude Competition Maps</option>
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
  computed: {
    choice: {
      get(): string {
        if (this.value.mapLike?.length == 1 && this.value.mapLike[0] == 'Competition') {
          return 'include'
        }
        if (this.value.mapNotLike?.length == 1 && this.value.mapNotLike[0] == 'Competition') {
          return 'exclude'
        }
        return 'all'
      },
      set(v: string) {
        if (v == 'include') {
          this.$parent.$emit('slice', {
            mapLike: ['Competition'],
            mapNotLike: [],
          })
        }
        if (v == 'exclude') {
          this.$parent.$emit('slice', {
            mapLike: [],
            mapNotLike: ['Competition'],
          })
        }
        if (v == 'all') {
          this.$parent.$emit('slice', {
            mapLike: [],
            mapNotLike: [],
          })
        }
      }
    },
  },
})
</script>
