<template>
  <div>
    {{ hours }}
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { formatSI } from '~/lib/util'

export default Vue.extend({
  data() {
    return {
      totalPicks: 0,
    }
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('stats.total', 'map',
      [],
      ['picks'],
      { trophy_season_end: ['month'] },
      { cache: 60*10 })
    this.totalPicks = data.data[0].picks
  },
  computed: {
    hours(): string {
      const dailyPicks = this.totalPicks / 4 / 7
      return formatSI(dailyPicks * 3, 2)
    },
  },
})
</script>
