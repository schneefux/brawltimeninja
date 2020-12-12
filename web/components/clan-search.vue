<template>
  <card
    title="Name Search"
    subtitle="Search common player names or Clans"
  >
    <template v-slot:content>
      <form @submit.prevent="$fetch">
        <input
          type="text"
          v-model="pattern"
          class="form-input bg-gray-800 text-gray-400"
        >
        <b-button
          tag="input"
          type="submit"
          value="Calculate"
          md
          primary
        ></b-button>
      </form>

      <dl>
        <div>
          <dt class="inline">Users</dt>
          <dd class="inline">{{ formatSI(data.users) }}</dd>
        </div>
        <div>
          <dt class="inline">Battles</dt>
          <dd class="inline">{{ metaStatMaps.formatters.picks(data.picks) }}</dd>
        </div>
        <div>
          <dt class="inline">{{ metaStatMaps.labels.winRate }}</dt>
          <dd class="inline">{{ metaStatMaps.formatters.winRate(data.battle_victory) }}</dd>
        </div>
      </dl>
    </template>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'
import { formatSI, metaStatMaps } from '~/lib/util'

interface Row {
  picks: number
  users: number
  battle_victory: number
}

export default Vue.extend({
  data() {
    return {
      pattern: '',
      data: {} as Row,
    }
  },
  fetchDelay: 0,
  async fetch() {
    const data = await this.$clicker.query('player.clan', 'battle',
      [], ['picks', 'users', 'battle_victory'], {
        ...this.$clicker.defaultSlices('battle'),
        trophy_season_end: ['current'],
        player_name_ilike: ['%' + this.pattern + '%'],
      }, {
        cache: 60*60,
      })

    this.data = data.data[0]
  },
  computed: {
    metaStatMaps() {
      return metaStatMaps
    },
    formatSI() {
      return formatSI
    },
  },
})
</script>
