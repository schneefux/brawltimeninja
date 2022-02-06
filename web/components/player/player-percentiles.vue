<template>
  <scrolling-dashboard>
    <c-dashboard-cell
      v-for="achievement in achievements"
      :key="achievement.metric"
      :columns="2"
    >
      <b-bigstat
        :title="achievement.metric"
        :value="achievement.text"
        full-height
      ></b-bigstat>
    </c-dashboard-cell>
  </scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, useContext } from '@nuxtjs/composition-api'
import { Player } from '~/model/Api'
import ztable from 'ztable'
import { BBigstat, CDashboardCell } from '@schneefux/klicker/components'

interface Achievement {
  metric: string
  text: string
}

export default defineComponent({
  components: {
    BBigstat,
    CDashboardCell,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
  },
  setup(props) {
    const { i18n } = useContext()

    const achievements = computed<Achievement[]>(() => {
      // 2020-08-08 highest trophies
      const trophiesMu = 15390
      const trophiesSigma = 5433
      const trophiesZ = (props.player.highestTrophies - trophiesMu) / trophiesSigma

      // 2020-08-08 max highest brawler trophies
      const brawlerMu = 640
      const brawlerSigma = 153
      const maxHighestBrawlerTrophies = Math.max.apply(Object.values(props.player.brawlers).map(b => b.highestTrophies))
      const brawlerZ = (maxHighestBrawlerTrophies - brawlerMu) / brawlerSigma

      // TODO do not use a normal distribution for these
      // 2020-08-08
      const victoriesMu = 2577
      const victoriesSigma = 2940
      const victoryZ = (props.player['3vs3Victories'] - victoriesMu) / victoriesSigma

      const soloMu = 437
      const soloSigma = 441
      const soloZ = (props.player.soloVictories - soloMu) / soloSigma

      const duoMu = 698
      const duoSigma = 695
      const duoZ = (props.player.duoVictories - duoMu) / duoSigma

      // 2020-08-08 championship challenge
      const ccPercentile = props.player.isQualifiedFromChampionshipChallenge ? 0.95 : 0.05

      // TODO create an endpoint?
      const allAchievements = [{
        metric: i18n.tc('metric.highestTrophies'),
        percentile: ztable(trophiesZ),
      }, {
        metric: i18n.tc('metric.highestBrawlerTrophies'),
        percentile: ztable(brawlerZ),
      }, {
        metric: i18n.tc('metric.isQualifiedFromChampionshipChallenge'),
        percentile: ccPercentile,
      }, {
        metric: i18n.tc('metric.victories'),
        percentile: ztable(victoryZ),
      }, {
        metric: i18n.tc('metric.soloVictories'),
        percentile: ztable(soloZ),
      }, {
        metric: i18n.tc('metric.duoVictories'),
        percentile: ztable(duoZ),
      }].sort((a1, a2) => a2.percentile - a1.percentile)

      const goodAchievements = allAchievements
        .filter(a => a.percentile >= 0.5)
      const achievements = goodAchievements.length == 0 ? allAchievements.slice(0, 1) : goodAchievements

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
          return i18n.t('rating.above-average') as string
        }
        return i18n.t('rating.percentile-of', { part: p * base, total: base }) as string
      }

      return achievements.map(a => ({
        metric: a.metric,
        text: formatPercentile(a.percentile),
      }))
    })

    return {
      achievements,
    }
  },
})
</script>
