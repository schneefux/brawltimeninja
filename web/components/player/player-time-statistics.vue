<template>
  <b-scrolling-dashboard
    @scroll.once="$emit('interact')"
  >
    <b-dashboard-cell :columns="2">
      <b-bigstat :title="$t('metric.hours-spent')">
        <template v-slot:content><p >
          <fa
            :icon="faClock"
            class="mr-1 inline"
          ></fa>
          <span ref="hourCounter">
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
        <template v-slot:content>
          <p :ref="el => setCounterRef(statName, el)">
            ...
          </p>
        </template>
      </b-bigstat>
    </b-dashboard-cell>
  </b-scrolling-dashboard>
</template>

<script lang="ts">
import { Player } from '@/model/Api'
import { xpToHours } from '~/lib/util'
import { BBigstat, BDashboardCell } from '@schneefux/klicker/components'
import { ref, computed, defineComponent, onMounted, PropType } from 'vue'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import Fa from 'vue-fa'
import { useI18n } from 'vue-i18n'

interface FunStat {
  label: string
  value: (n: number) => number
}

export default defineComponent({
  components: {
    BBigstat,
    BDashboardCell,
    Fa,
  },
  props: {
    player: {
      type: Object as PropType<Player>,
      required: true
    },
  },
  setup(props) {
    const hourCounter = ref<HTMLElement>()
    const counterRefs = ref<Record<string, HTMLElement|null>>({})
    const setCounterRef = (id: string|number, el: unknown|null) => counterRefs.value[id] = el as HTMLElement|null
    const i18n = useI18n()

    const startCounter = () => {
      const playerHours = Math.max(hours.value, 1)
      const animationDuration = 3000

      const setCounters = (hoursSpent: number) => {
        if (hourCounter.value == undefined) {
          // not rendered yet
          return
        }
        hourCounter.value.textContent = Math.floor(hoursSpent).toString()
        Object.entries(funStats.value).forEach(([key, stat], index) => {
          const funCounter = counterRefs.value[key]
          if (funCounter != undefined) {
            funCounter.textContent = Math.floor(stat.value(hoursSpent)).toString()
          }
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
    const funStats = computed<Record<string, FunStat>>(() => ({
      recharges: {
        // measured with AccuBattery on my phone
        label: i18n.t('metric.battery'),
        value: (h) => h / 4.27
      },
      toiletBreaks: {
        // https://www.unilad.co.uk/featured/this-is-how-much-of-your-life-youve-spent-on-the-toilet/
        // 102 minutes over 7 days = 1/4 h/day, assuming 1 session/day
        label: i18n.t('metric.toilet'),
        value: (h) => h / (102 / 7 / 60)
      },
      books: {
        // https://io9.gizmodo.com/how-long-will-it-take-to-read-that-book-this-chart-giv-1637170555
        label: i18n.t('metric.book'),
        value: (h) => h / 7.72
      },
      songs: {
        // https://www.statcrunch.com/5.0/viewreport.php?reportid=28647&groupid=948
        label: i18n.t('metric.song'),
        value: (h) => h / (3.7 / 60)
      },
    }))

    return {
      funStats,
      faClock,
      hourCounter,
      setCounterRef,
    }
  },
})
</script>
