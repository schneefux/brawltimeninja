<template>
  <player-sharepic
    :player="player"
    :winRate="winRate"
    :total-battles="totalBattles"
    :account-rating="accountRating"
    class="sharepic"
  ></player-sharepic>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import { mapState } from 'vuex'
import { BattleTotalRow } from '@/components/player/player-battles-stats.vue'
import { ratingPercentiles, tagToId } from '~/lib/util'
import { Player } from '~/model/Api'

export default Vue.extend({
  head(): MetaInfo {
    // block all requests except to subdomains (including ads/analytics)
    const allowedOrigins = [this.$config.clickerUrl, this.$config.mediaUrl, this.$config.cubeUrl]
    return {
      meta: [ <any>{
        // FIXME remove any after https://github.com/nuxt/vue-meta/issues/575
        'http-equiv': 'Content-Security-Policy',
        content: `default-src 'self' 'unsafe-inline' 'unsafe-eval' ${allowedOrigins.join(' ')}`,
      } ]
    }
  },
  layout: 'empty',
  middleware: ['cached'],
  data() {
    return {
      player: {} as Player,
      battleTotals: {} as BattleTotalRow,
    }
  },
  computed: {
    winRate(): number {
      if (this.battleTotals.picks > 0) {
        return this.battleTotals.winRate
      }
      if (this.player.battles.length == 0) {
        return 0
      }
      return this.player.battles.filter((battle) => battle.victory).length / this.player.battles.length
    },
    totalBattles(): number {
      return this.battleTotals.picks || this.player.battles.length
    },
    brawlersUnlocked(): number {
      return Object.keys(this.player.brawlers).length
    },
    trophiesGoal(): number {
      const brawlerTrophies = [...Object.values(this.player.brawlers)]
        .map(({ trophies }) => trophies)
      brawlerTrophies.sort()
      const medBrawlerTrophies = brawlerTrophies[Math.floor(brawlerTrophies.length / 2)]
      return medBrawlerTrophies * this.totalBrawlers
    },
    accountRating(): string {
      const medTrophies = this.trophiesGoal / this.totalBrawlers
      for (const key in ratingPercentiles) {
        if (medTrophies <= ratingPercentiles[key][1]) {
          return key
        }
      }
      return '?'
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
    }),
  },
  async validate({ store, params, redirect }) {
    const tag = params.tag.toUpperCase()
    if (tag != params.tag) {
      redirect(`/embed/profile/${tag}`)
      return false
    }

    return RegExp(store.state.tagPattern).test(tag)
  },
  async asyncData({ params, $http, $config, $cube }): Promise<{ player: Player, battleTotals: BattleTotalRow }> {
    const player = await $http.$get($config.apiUrl + `/api/player/${params.tag}`)

    const battleData = await $cube.query({
      cubeId: 'battle',
      dimensionsIds: [],
      measurementsIds: ['picks', 'winRate', 'trophyChange'],
      slices: {
        playerId: [tagToId(params.tag)],
      },
      sortId: 'picks',
      comparing: false,
      comparingSlices: {},
    })

    return {
      player: player as Player,
      battleTotals: battleData.data[0].measurementsRaw as any as BattleTotalRow,
    }
  },
})
</script>

<style lang="postcss" scoped>
.sharepic {
  width: 600px;
  height: 314px;
}
</style>
