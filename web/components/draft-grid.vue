<template>
  <div>
    <b-card
      title="Add Brawlers to your team"
      :loading="loading > 0"
    >
      <div slot="content" class="mt-1 mb-3 grid grid-cols-6 md:grid-cols-8 gap-2">
        <button
          v-for="brawler in allyData"
          :key="brawler.brawlerId"
          :class="['relative border-2 md:border-4 rounded-md', {
            'border-red-400': brawler.normAvgWinRate < 0.4,
            'border-gray-400': brawler.normAvgWinRate >= 0.4 && brawler.normAvgWinRate < 0.6,
            'border-green-400': brawler.normAvgWinRate >= 0.6,
            'opacity-50': !brawler.selectable,
          }]"
          @click="addToTeam(brawler)"
        >
          <media-img
            :path="`/brawlers/${brawler.brawlerId}/avatar`"
            :alt="brawler.brawlerName"
            size="160"
            clazz="rounded-sm"
          ></media-img>
          <span class="absolute bottom-0 right-0 px-1 bg-gray-800 bg-opacity-75 leading-tight text-sm md:text-base rounded-br-sm">
            {{ brawler.avgWinRateFormatted }}
          </span>
        </button>
      </div>
    </b-card>

    <b-card
      title="Selected Team"
    >
      <div slot="content" class="mb-3">
        <p v-show="team.length == 0">
          No Brawlers selected
        </p>
        <p v-if="team.length > 0">
          Click to remove.
          <br />
          Estimated win rate: <span class="font-semibold">{{ team[team.length - 1].avgWinRateFormatted }}</span>
        </p>

        <div class="flex justify-center mx-2 my-3 space-x-2">
          <button
            v-for="(brawler, index) in team"
            :key="brawler.brawlerId"
            @click="removeFromTeam(index)"
          >
            <media-img
              :path="`/brawlers/${brawler.brawlerId}/avatar`"
              :alt="brawler.brawlerName"
              size="160"
              clazz="rounded-md w-12 md:w-16"
            ></media-img>
          </button>
        </div>
      </div>
    </b-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, useAsync, useContext } from '@nuxtjs/composition-api'
import { computed, PropType, ref, watch } from '@vue/composition-api'
import { CubeQuery } from '~/klicker'
import { brawlerId, capitalizeWords } from '~/lib/util'
import { BCard } from '~/klicker/components'

interface AllyData {
  brawlerId: string
  brawlerName: string
  winRates: number[]
  avgWinRateFormatted: string
  normAvgWinRate: number
  selectable: boolean
}

export default defineComponent({
  components: {
    BCard,
  },
  props: {
    query: {
      type: Object as PropType<CubeQuery>,
      required: true,
    },
  },
  setup(props) {
    const { $klicker } = useContext()

    const team = ref<AllyData[]>([])
    const loading = ref(0)

    async function getBrawlerData() {
      loading.value++
      const data = await $klicker.query({
        cubeId: 'battle',
        slices: props.query.slices,
        dimensionsIds: ['brawler'],
        measurementsIds: ['winRateAdj'],
        sortId: 'winRateAdj',
      })
      loading.value--
      return data
    }

    async function getSynergyData() {
      loading.value++
      const data = await $klicker.query({
        cubeId: 'synergy',
        slices: props.query.slices,
        dimensionsIds: ['brawler', 'ally'],
        measurementsIds: ['winRateAdj'],
        sortId: 'winRateAdj',
      })
      loading.value--
      return data
    }

    const brawlerData = useAsync(() => getBrawlerData(), 'draft-grid-brawler-data')
    const synergyData = useAsync(() => getSynergyData(), 'draft-grid-synergy-data')

    watch(() => props.query.slices, async () => {
      brawlerData.value = await getBrawlerData()
      synergyData.value = await getSynergyData()
    })

    // TODO maybe replace by clicker bayes magic
    const allyData = computed(() => {
      let avgWinRateByAlly: Record<string, number[]> = {}

      if (team.value.length == 0) {
        brawlerData.value?.data?.forEach(row => {
          const name = row.dimensionsRaw.brawler.brawler
          const winRate = row.measurementsRaw.winRateAdj as number
          avgWinRateByAlly[name] = [winRate]
        })
      } else {
        synergyData.value?.data?.forEach(row => {
          const name = row.dimensionsRaw.brawler.brawler
          if (!(name in avgWinRateByAlly)) {
            avgWinRateByAlly[name] = []
          }

          const winRate = row.measurementsRaw.winRateAdj as number
          const allyId = brawlerId({ name: row.dimensionsRaw.ally.ally })
          if (team.value.find(brawler => brawler.brawlerId == allyId)) {
            avgWinRateByAlly[name].push(winRate)
          }
        })
      }

      const newAllyData: AllyData[] = []
      for (const [brawler, winRates] of Object.entries(avgWinRateByAlly)) {
        const sufficientData = team.value.length == 0 || winRates.length == team.value.length
        const id = brawlerId({ name: brawler })
        const avgWinRate = winRates.reduce((sum, value) => sum + value, 0) / winRates.length
        newAllyData.push({
          winRates,
          brawlerId: id,
          brawlerName: capitalizeWords(brawler),
          avgWinRateFormatted: sufficientData ? `${Math.round(100*avgWinRate)}%` : '?',
          normAvgWinRate: avgWinRate,
          selectable: sufficientData && !team.value.some(b => b.brawlerId == id) && team.value.length < 3,
        })
      }
      const avgWinRateMin = newAllyData.reduce((min, brawler) => Math.min(min, brawler.normAvgWinRate), Infinity)
      const avgWinRateMax = newAllyData.reduce((max, brawler) => Math.max(max, brawler.normAvgWinRate), 0)
      newAllyData.forEach(brawler => brawler.normAvgWinRate = (brawler.normAvgWinRate - avgWinRateMin) / (avgWinRateMax - avgWinRateMin))
      return newAllyData.sort((b1, b2) => b1.brawlerId < b2.brawlerId ? -1 : 1)
    })

    const addToTeam = (brawler: AllyData) => {
      if (!brawler.selectable) {
        return
      }

      team.value.push(brawler)
    }

    const removeFromTeam = (index: number) => {
      team.value.splice(index, 1)
    }

    return {
      loading,
      team,
      addToTeam,
      removeFromTeam,
      allyData,
    }
  },
})
</script>