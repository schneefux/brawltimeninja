<template>
  <b-scrolling-dashboard
    @scroll.once="$emit('interact')"
  >
    <b-dashboard-cell
      v-for="progression in progressions"
      :key="progression.metric"
      :columns="2"
    >
      <b-bigstat :title="progression.metric">
        <template v-slot:content>
          <!-- TODO refactor progress into klicker component -->
          <progress
            :max="progression.max"
            :value="progression.current"
            class="progress"
          >{{ Math.floor(100 * progression.current / progression.max) }}%</progress>
          <img
            :src="progression.icon"
            :alt="progression.metric"
            class="inline h-5 mb-1 mr-1"
          >
          <span>{{ progression.currentFormatted }}</span>
          <span
            v-if="progression.max > 0"
            class="text-text/75"
          > / {{ progression.maxFormatted }}</span>
        </template>
      </b-bigstat>
    </b-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { Player } from '~/model/Api'
import { BScrollingDashboard, BBigstat, BDashboardCell, BKvTable } from '@schneefux/klicker/components'
import { calculateProgression, calculatePlayerProgression, calculateSeasonEndReward, formatSI } from '~/lib/util'
import { useAllBrawlersWithAllAccessories } from '~/composables/dimension-values'
import { useI18n } from 'vue-i18n'
import goldCoinIcon from '~/assets/images/icon/gold_coin.png'
import trophyIcon from '~/assets/images/icon/trophy_optimized.png'
import starPowerIcon from '~/assets/images/icon/SP_base@4x.png'
import gearIcon from '~/assets/images/icon/gear_icon.png'
import gadgetIcon from '~/assets/images/icon/Gadget.png'
import shellyIcon from '~/assets/images/icon/shelly.png'

interface Progression {
  icon: string
  metric: string
  current: number
  currentFormatted: string
  max: number
  maxFormatted: string
}

export default defineComponent({
  components: {
    BBigstat,
    BKvTable,
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
    const maxedBrawlers = useAllBrawlersWithAllAccessories()

    const progressions = computed<Progression[]>(() => {
      const maxStats = calculateProgression(maxedBrawlers.value.map(b => ({
        power: 11,
        starPowersCount: b.starpowers.length,
        gadgetsCount: b.gadgets.length,
        gearNames: b.gears.map(g => g.accessory.brawlstarsId),
      })))
      const stats = calculatePlayerProgression(props.player)

      const format = (n: number) => i18n.n(n)

      return [{
        metric: i18n.t('player.progression.coins-to-max'),
        icon: goldCoinIcon,
        current: stats.coins.total,
        max: maxStats.coins.total,
      }, {
        metric: i18n.t('brawler', 2),
        icon: shellyIcon,
        current: stats.counts.brawler,
        max: maxStats.counts.brawler,
      }, {
        metric: i18n.t('starpower', 2),
        icon: starPowerIcon,
        current: stats.counts.starPower,
        max: maxStats.counts.starPower,
      }, {
        metric: i18n.t('gadget', 2),
        icon: gadgetIcon,
        current: stats.counts.gadget,
        max: maxStats.counts.gadget,
      }, {
        metric: i18n.t('gear', 2),
        icon: gearIcon,
        current: stats.counts.gear,
        max: maxStats.counts.gear,
      }].map(p => {
        const currentFormatted = formatSI(p.current)
        const maxFormatted = formatSI(p.max)
        return {
          ...p,
          currentFormatted: format(currentFormatted.number) + currentFormatted.symbol,
          maxFormatted: format(maxFormatted.number) + maxFormatted.symbol,
        }
      })
    })

    return {
      progressions,
      trophyIcon,
    }
  },
})
</script>

<style lang="postcss" scoped>
.progress {
  @apply w-full h-3;
}

.progress::-webkit-progress-bar {
  @apply rounded-full bg-contrast/10;
}

.progress::-webkit-progress-value {
  @apply rounded-full bg-primary-400;
}
</style>
