<template>
  <b-scrolling-dashboard
    @scroll.once="$emit('interact')"
  >
    <b-dashboard-cell
      v-for="achievement in achievements"
      :key="achievement.metric"
      :columns="2"
    >
      <b-bigstat
        :title="achievement.metric"
        :value="achievement.text"
      ></b-bigstat>
    </b-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { Player } from '~/model/Api'
// @ts-ignore
import ztable from 'ztable'
import { BScrollingDashboard, BBigstat, BDashboardCell } from '@schneefux/klicker/components'
import { useI18n } from 'vue-i18n'

interface Achievement {
  metric: string
  text: string
}

export default defineComponent({
  components: {
    BBigstat,
    BDashboardCell,
    BScrollingDashboard,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true,
    },
  },
  setup(props) {
    const i18n = useI18n()

    const achievements = computed<Achievement[]>(() => {
      // 2023-11-07
      // select avg(player_highest_trophies), stddev_samp(player_highest_trophies), avg(brawler_highest_trophies), stddev_samp(brawler_highest_trophies), avg(player_3vs3_victories), stddev_samp(player_3vs3_victories), avg(player_solo_victories), stddev_samp(player_solo_victories), avg(player_duo_victories), stddev_samp(player_duo_victories) from brawler where trophy_season_end>=now()-interval 28 day and timestamp>now()-interval 28 day and timestamp<now()-interval 27 day \G
      const trophiesMu = 35515
      const trophiesSigma = 15196
      const trophiesZ = (props.player.highestTrophies - trophiesMu) / trophiesSigma

      const brawlerMu = 587
      const brawlerSigma = 266
      const maxHighestBrawlerTrophies = Math.max.apply(Object.values(props.player.brawlers).map(b => b.highestTrophies))
      const brawlerZ = (maxHighestBrawlerTrophies - brawlerMu) / brawlerSigma

      // TODO do not use a normal distribution for these
      const victoriesMu = 10851
      const victoriesSigma = 14114
      const victoryZ = (props.player['3vs3Victories'] - victoriesMu) / victoriesSigma

      const soloMu = 1524
      const soloSigma = 1986
      const soloZ = (props.player.soloVictories - soloMu) / soloSigma

      const duoMu = 1772
      const duoSigma = 2988
      const duoZ = (props.player.duoVictories - duoMu) / duoSigma

      // TODO create an endpoint?
      const achievements = [{
        metric: i18n.t('metric.highestTrophies'),
        percentile: ztable(trophiesZ),
      }, {
        metric: i18n.t('metric.highestBrawlerTrophies'),
        percentile: ztable(brawlerZ),
      }, {
        metric: i18n.t('metric.victories'),
        percentile: ztable(victoryZ),
      }, {
        metric: i18n.t('metric.soloVictories'),
        percentile: ztable(soloZ),
      }, {
        metric: i18n.t('metric.duoVictories'),
        percentile: ztable(duoZ),
      }].sort((a1, a2) => a2.percentile - a1.percentile)

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
          return i18n.t('rating.above-average')
        }
        return i18n.t('rating.percentile-of', { part: p * base, total: base })
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
