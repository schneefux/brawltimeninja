<template>
  <div>
    <div class="section mt-4 card px-3 py-2 card--dark">
      <span class="mr-2">View Mode</span>
      <button
        class="button mr-2"
        :class="{
          'button--selected': view == 'tierlist',
        }"
        @click="setView('tierlist')"
      >Tier List</button>
      <button
        class="button mr-2"
        :class="{
          'button--selected': view == 'table',
        }"
        @click="setView('table')"
      >Table</button>
      <button
        class="button mr-2"
        :class="{
          'button--selected': view == 'legacy',
        }"
        @click="setView('legacy')"
      >Grid</button>
    </div>

    <tier-list
      v-if="view == 'tierlist'"
      :entries="entries"
      :stat="measurement"
    ></tier-list>
    <meta-table
      v-if="view == 'table'"
      :entries="entries"
      :stat="measurement"
    ></meta-table>
    <meta-grid
      v-if="view == 'legacy'"
      :entries="entries"
      :key="measurement"
      :default-stat="measurement"
      :ga-category="gaCategory"
    ></meta-grid>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MetaGridEntry } from '../lib/util'

export default Vue.extend({
  props: {
    entries: {
      type: Array as PropType<MetaGridEntry[]>,
      required: true
    },
    measurement: {
      type: String,
      required: true
    },
    gaCategory: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      view: 'tierlist',
    }
  },
  methods: {
    setView(v: string) {
      this.$emit('view', v)
      this.view = v
      this.$ga.event(this.gaCategory, 'click', 'show_' + v)
    },
  },
})
</script>
