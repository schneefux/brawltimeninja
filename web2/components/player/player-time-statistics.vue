<template>
  <b-scrolling-dashboard
    @scroll.once="$emit('interact')"
  >
    <b-dashboard-cell :columns="2">
      <b-bigstat :title="$t('metric.hours-spent')">
        <template v-slot:content><p >
          <font-awesome-icon
            :icon="faClock"
            class="mr-1"
          ></font-awesome-icon>
          <span ref="counter-hours">
            ...
          </span>
        </p></template>
      </b-bigstat>
    </b-dashboard-cell>

    <b-dashboard-cell>
      <div class="flex justify-center items-center h-full">
        <p class="text-center">{{ $t('player.equals') }}</p>
      </div>
    </b-dashboard-cell>

    <b-dashboard-cell
      v-for="(stat, statName) in funStats"
      :key="statName"
      :columns="2"
    >
      <b-bigstat :title="stat.label">
        <template v-slot:content><p

          ref="counter-funstats"
        >
          ...
        </p></template>
      </b-bigstat>
    </b-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { Player } from '@/model/Api'
import { xpToHours } from '~/lib/util'
import { BBigstat, BDashboardCell } from '@schneefux/klicker/components'
import { computed, defineComponent, onMounted, PropType } from 'vue'
import { getCurrentInstance } from 'vue'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { useContext } from '~/composables/compat'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

interface FunStat {
  label: string
  value: (n: number) => number
}

export default defineComponent({
  components: {
    BBigstat,
    BDashboardCell,
    FontAwesomeIcon,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
  },
  // TODO replace refs by function ref when migrating to Vue 3
  setup(props) {
    const refs = getCurrentInstance()!.proxy.$refs // TODO refactor for Vue 2.7+
    const { i18n } = useContext()

    const startCounter = () => {
      const playerHours = Math.max(hours.value, 1)
      const animationDuration = 3000

      const setCounters = (hoursSpent: number) => {
        const counter = refs['counter-hours'] as HTMLElement
        if (counter == undefined) {
          // not rendered yet
          return
        }
        counter.textContent = Math.floor(hoursSpent).toString()
        Object.values(funStats.value).forEach((stat, index) => {
          const funCounter = refs['counter-funstats']![index] as HTMLElement
          funCounter.textContent = Math.floor(stat.value(hoursSpent)).toString()
        })
      }

      let animationStart = undefined as number|undefined
      const animateHours = () => window.requestAnimationFrame((timestamp) => {
        if (animationStart == undefined) {
          animationStart = timestamp
        }

        const easeOutCubic = 1 - Math.pow(1 - Math.min(1, (timestamp - animationStart) / animationDuration), 3)
        const hoursSpent = playerHours * easeOutCubic
        setCounters(hoursSpent)

        if (timestamp - animationStart <= animationDuration) {
          animateHours()
        }
      })

      animateHours()
    }

    onMounted(() => startCounter())

    const hours = computed(() => xpToHours(props.player.expPoints))
    const funStats = computed<{ [name: string]: FunStat }>(() => ({
      recharges: {
        // measured with AccuBattery on my phone
        label: i18n.t('metric.battery') as string,
        value: (h) => h / 4.27
      },
      toiletBreaks: {
        // https://www.unilad.co.uk/featured/this-is-how-much-of-your-life-youve-spent-on-the-toilet/
        // 102 minutes over 7 days = 1/4 h/day, assuming 1 session/day
        label: i18n.t('metric.toilet') as string,
        value: (h) => h / (102 / 7 / 60)
      },
      books: {
        // https://io9.gizmodo.com/how-long-will-it-take-to-read-that-book-this-chart-giv-1637170555
        label: i18n.t('metric.book') as string,
        value: (h) => h / 7.72
      },
      songs: {
        // https://www.statcrunch.com/5.0/viewreport.php?reportid=28647&groupid=948
        label: i18n.t('metric.song') as string,
        value: (h) => h / (3.7 / 60)
      },
    }))

    return {
      funStats,
      faClock,
    }
  },
})
</script>
