<template>
  <div class="brawler-avatars">
    <div v-if="$fetchState.pending" class="brawler-avatars__placeholder" style="height: 55px"></div>
    <div
      v-for="team in teams.slice(0, limit)"
      :key="team.id"
      class="brawler-avatars__element w-1/2 mx-1"
    >
      <div
        v-for="brawler in team.brawlers"
        :key="brawler"
        class="brawler-avatar"
        :class="{
          'w-1/2': team.brawlers.length == 2,
          'w-1/3': team.brawlers.length == 3,
        }"
      >
        <router-link
          :to="`/tier-list/brawler/${brawlerId({ name: brawler })}`"
        >
          <media-img
            :path="`/brawlers/${brawlerId({ name: brawler })}/avatar`"
            :alt="brawler"
            size="160"
            clazz="brawler-avatar__img"
          ></media-img>
        </router-link>
      </div>
    </div>
    <p v-if="!$fetchState.pending && teams.length == 0">
      No data.
    </p>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import Vue, { PropType } from 'vue'
import { MetaInfo } from 'vue-meta'
import { brawlerId, capitalizeWords, metaStatMaps } from '~/lib/util'

interface Team {
  id: string
  brawlers: string[]
  wins: number
  winRate: number
}

export default Vue.extend({
  props: {
    map: {
      type: String,
    },
    mode: {
      type: String,
    },
    season: {
      type: String,
    },
    limit: {
      type: Number,
      default: 2,
    },
  },
  data() {
    return {
      teams: [] as Team[],
    }
  },
  watch: {
    map: '$fetch',
    mode: '$fetch',
    season: '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const slices = {
      ...this.$clicker.defaultSlices('synergy'),
      ...(this.map != undefined ? {
        battle_event_map: [this.map],
      } : {}),
      ...(this.mode != undefined ? {
        battle_event_mode: [this.mode],
      } : {}),
      ...(this.season != undefined ? {
        trophy_season_end: undefined,
        trophy_season_end_exact: [this.season],
      } : {}),
    }
    this.teams = []

    // save bandwith and computation time by approximating top N
    const teams = await this.$clicker.calculateTeams(slices, 'meta.map.best-teams', this.limit * this.totalBrawlers)
    this.teams = teams.teams
      .sort((t1, t2) => t2.wins - t1.wins)
      .map((t) => (<Team>{
        id: t.brawlers.join('+'),
        brawlers: t.brawlers,
        wins: t.wins,
        winRate: t.wins / t.picks,
      }))
  },
  computed: {
    brawlerId() {
      return brawlerId
    },
    metaStatMaps() {
      return metaStatMaps
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers,
    })
  },
})
</script>
