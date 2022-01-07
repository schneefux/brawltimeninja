<template>
  <player-sharepic
    :player="player"
    :win-rate="winRate"
    :total-battles="totalBattles"
    :account-rating="accountRating"
    class="sharepic"
  ></player-sharepic>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaInfo } from 'vue-meta'
import { mapState } from 'vuex'
import { ratingPercentiles, tagToId } from '~/lib/util'
import { Player } from '~/model/Api'

export default Vue.extend({
  head(): MetaInfo {
    // block all requests except to subdomains (including ads/analytics)
    const allowedOrigins = [this.$config.mediaUrl, this.$config.cubeUrl, this.$config.apiUrl]
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
      winRate: 0,
      totalBattles: 0,
    }
  },
  computed: {
    accountRating(): string {
      const brawlerTrophies = [...Object.values(this.player.brawlers)]
        .map(({ trophies }) => trophies)
      brawlerTrophies.sort()
      const medBrawlerTrophies = brawlerTrophies[Math.floor(brawlerTrophies.length / 2)]
      const trophiesGoal = medBrawlerTrophies * this.totalBrawlers
      const medTrophies = trophiesGoal / this.totalBrawlers
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
  async asyncData({ params, $http, $config, $klicker }) {
    const player = await $http.$get<Player>($config.apiUrl + `/api/player/${params.tag}`)

    const battleData = await $klicker.query({
      cubeId: 'battle',
      dimensionsIds: [],
      measurementsIds: ['picks', 'winRate', 'trophyChange'],
      slices: {
        playerId: [tagToId(params.tag)],
      },
      sortId: 'picks',
    })

    const winRate = battleData.data[0].measurementsRaw.winRate as number
      || (player.battles.length == 0 ? 0 : player.battles.filter((battle) => battle.victory).length / player.battles.length)
    const totalBattles = battleData.data[0].measurementsRaw.picks as number
      || player.battles.length

    return {
      player,
      winRate,
      totalBattles,
    }
  },
})
</script>

<style lang="postcss" scoped>
.sharepic {
  width: 600px;
  height: 315px;
}
</style>
