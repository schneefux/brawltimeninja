<template>
  <dl class="flex flex-col md:flex-row md:flex-wrap md:justify-center">
    <card
      v-for="achievement in achievements"
      :key="achievement.metric"
      class="text-center"
      elevation="2"
      light
    >
      <template v-slot:content>
        <dt class="block text-xl font-bold">
          {{ achievement.metric }}
        </dt>
        <dd class="block text-yellow-700 font-semibold">
          {{ achievement.text }}
        </dd>
      </template>
    </card>
  </dl>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Player } from '~/model/Api'
import ztable from 'ztable'

interface Achievement {
  metric: string
  text: string
}

export default Vue.extend({
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
  },
  computed: {
    achievements(): Achievement[] {
      // 2020-08-08 highest trophies
      const trophiesMu = 15390
      const trophiesSigma = 5433
      const trophiesZ = (this.player.highestTrophies - trophiesMu) / trophiesSigma

      // 2020-08-08 max highest brawler trophies
      const brawlerMu = 640
      const brawlerSigma = 153
      const maxHighestBrawlerTrophies = Math.max.apply(Object.values(this.player.brawlers).map(b => b.highestTrophies))
      const brawlerZ = (maxHighestBrawlerTrophies - brawlerMu) / brawlerSigma

      // TODO do not use a normal distribution for these
      // 2020-08-08
      const victoriesMu = 2577
      const victoriesSigma = 2940
      const victoryZ = (this.player['3vs3Victories'] - victoriesMu) / victoriesSigma

      const soloMu = 437
      const soloSigma = 441
      const soloZ = (this.player.soloVictories - soloMu) / soloSigma

      const duoMu = 698
      const duoSigma = 695
      const duoZ = (this.player.duoVictories - duoMu) / duoSigma

      // 2020-08-08 championship challenge
      const ccPercentile = this.player.isQualifiedFromChampionshipChallenge ? 0.95 : 0.05

      // TODO create an endpoint?
      const allAchievements = [{
        metric: this.$tc('metric.highestTrophies'),
        percentile: ztable(trophiesZ),
      }, {
        metric: this.$tc('metric.highestBrawlerTrophies'),
        percentile: ztable(brawlerZ),
      }, {
        metric: this.$tc('metric.isQualifiedFromChampionshipChallenge'),
        percentile: ccPercentile,
      }, {
        metric: this.$tc('metric.victories'),
        percentile: ztable(victoryZ),
      }, {
        metric: this.$tc('metric.soloVictories'),
        percentile: ztable(soloZ),
      }, {
        metric: this.$tc('metric.duoVictories'),
        percentile: ztable(duoZ),
      }].sort((a1, a2) => a2.percentile - a1.percentile)

      const goodAchievements = allAchievements
        .filter(a => a.percentile >= 0.5)
      const achievements = goodAchievements.length == 0 ? allAchievements.slice(0, 1) : goodAchievements

      const thiz = this
      function formatPercentile(p: number): string {
        let base = 10
        if (p >= 0.95) {
          base = 100
        }
        if (p >= 0.99) {
          base = 1000
        }
        if (p >= 0.999) {
          base = 10000
        }

        p = Math.floor(p * base) / base
        if (p == 0.5) {
          return thiz.$t('rating.above-average') as string
        }
        return thiz.$t('rating.percentile-of', { part: p * base, total: base }) as string
      }

      return achievements.map(a => ({
        metric: a.metric,
        text: formatPercentile(a.percentile),
      }))
    },
  },
})
</script>
