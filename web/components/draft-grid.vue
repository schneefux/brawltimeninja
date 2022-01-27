<template>
  <div>
    <b-card
      :title="$t('draft-tool.selected-team')"
    >
      <div slot="content">
        <p>
          <template v-if="team.length == 0">
            {{ $t('draft-tool.none-selected') }}
          </template>
          <template v-else>
            {{ $t('draft-tool.estimated.win-rate')}}: <span class="font-semibold">{{ teamWinRate }}</span>
          </template>
          <template v-if="notEnoughData">
            <br>{{ $t('draft-tool.not-enough-data') }}
          </template>
        </p>

        <div class="h-12 md:h-16 flex justify-center mx-2 my-3 space-x-2">
          <button
            v-for="brawlerId in team"
            :key="brawlerId"
            @click="removeFromTeam(brawlerId)"
          >
            <media-img
              :path="`/brawlers/${brawlerId}/avatar`"
              :alt="allyData[brawlerId].brawlerName"
              size="160"
              clazz="rounded-md w-12 md:w-16"
            ></media-img>
          </button>

          <b-button
            v-if="team.length > 0"
            @click="clearTeam()"
            class="mb-auto"
            primary
            round
            xs
          >
            <font-awesome-icon
              :icon="faTimes"
            ></font-awesome-icon>
          </b-button>
        </div>
      </div>
    </b-card>

    <b-card
      :title="$t('draft-tool.grid-title')"
      :loading="loading > 0"
    >
      <div slot="content" class="mt-1 mb-3 grid grid-cols-6 md:grid-cols-8 gap-2">
        <button
          v-for="brawler in allyData"
          :key="brawler.id"
          :class="['relative border-2 border-gray-800 shadow-md rounded-md', {
            'opacity-50': !brawler.selectable,
          }]"
          @click="addToTeam(brawler.id)"
        >
          <media-img
            :path="`/brawlers/${brawler.id}/avatar`"
            :alt="brawler.brawlerName"
            size="160"
            clazz="rounded-sm"
          ></media-img>
          <span
            v-if="brawler.selectable"
            class="absolute bottom-0 right-0 px-1 bg-gray-800 bg-opacity-80 leading-tight text-sm md:text-base rounded-br-sm"
            :class="{
              'text-red-400': brawler.normContributingWinRate < 0.33,
              'text-green-400': brawler.normContributingWinRate >= 0.66,
            }"
          >
            {{ brawler.contributingWinRateFormatted }}
          </span>
        </button>
      </div>
    </b-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, useAsync, useContext } from '@nuxtjs/composition-api'
import { computed, PropType, ref, watch } from '@vue/composition-api'
import { CubeQuery } from '@schneefux/klicker/types'
import { brawlerId, capitalizeWords } from '~/lib/util'
import { BCard } from '@schneefux/klicker/components'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

interface AllyData {
  id: string
  brawlerName: string
  contributingWinRate: number
  contributingWinRateFormatted: string
  normContributingWinRate: number
  sufficientData: boolean
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

    const team = ref<string[]>([])
    const loading = ref(0)

    async function getBrawlerData() {
      loading.value++
      const data = await $klicker.query({
        cubeId: 'battle',
        slices: props.query.slices,
        dimensionsIds: ['brawler'],
        metricsIds: ['winRate'],
        sortId: 'winRate',
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
        metricsIds: ['winRate', 'picks'],
        sortId: 'winRate',
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

    const picksThreshold = 30
    const allyData = computed(() => {
      let contributingWinRatesByBrawler: Record<string, number[]> = {}

      const winRatesByBrawler: Record<string, number> = {}
      brawlerData.value?.data?.forEach(row => {
        const name = row.dimensionsRaw.brawler.brawler
        const winRate = row.metricsRaw.winRate as number
        winRatesByBrawler[name] = winRate
        if (team.value.length == 0) {
          contributingWinRatesByBrawler[name] = [winRate]
        }
      })

      if (team.value.length != 0) {
        synergyData.value?.data?.forEach(row => {
          const name = row.dimensionsRaw.brawler.brawler
          if (!(name in contributingWinRatesByBrawler)) {
            contributingWinRatesByBrawler[name] = []
          }

          const allyName = row.dimensionsRaw.ally.ally
          if (name == allyName) {
            return
          }

          const winRate = row.metricsRaw.winRate as number
          const picks = row.metricsRaw.picks as number
          const allyId = brawlerId({ name: allyName })
          if (team.value.includes(allyId) && name != allyName && picks > picksThreshold) {
            contributingWinRatesByBrawler[name].push(winRate)
          }
        })
      }

      const newAllyData: AllyData[] = []
      for (const [brawler, contributingWinRates] of Object.entries(contributingWinRatesByBrawler)) {
        let contributingWinRate: number
        let sufficientData: boolean
        if (contributingWinRates.length > 0) {
          contributingWinRate = contributingWinRates.reduce((sum, value) => sum + value, 0) / contributingWinRates.length
        } else {
          contributingWinRate = winRatesByBrawler[brawler]
        }

        sufficientData = team.value.length == 0 || contributingWinRates.length == team.value.length

        const id = brawlerId({ name: brawler })
        newAllyData.push({
          id,
          contributingWinRate,
          brawlerName: capitalizeWords(brawler),
          contributingWinRateFormatted: sufficientData ? `${Math.round(100*contributingWinRate)}%` : '?',
          normContributingWinRate: contributingWinRate,
          sufficientData,
          selectable: sufficientData && team.value.length < 3,
        })
      }
      const min = newAllyData.reduce((min, brawler) => Math.min(min, brawler.contributingWinRate), Infinity)
      const max = newAllyData.reduce((max, brawler) => Math.max(max, brawler.contributingWinRate), 0)
      newAllyData.forEach(brawler => brawler.normContributingWinRate = (brawler.contributingWinRate - min) / (max - min))
      return Object.fromEntries(newAllyData
        .sort((b1, b2) => b1.id < b2.id ? -1 : 1)
        .map(b => [b.id, b])
      )
    })

    const addToTeam = (id: string) => {
      if (team.value.includes(id)) {
        removeFromTeam(id)
        return
      }

      if (!allyData.value[id].selectable) {
        return
      }

      team.value.push(id)
    }

    const removeFromTeam = (id: string) => team.value = team.value.filter(i => i != id)
    const clearTeam = () => team.value = []

    const teamWinRate = computed(() => {
      // average of AB,BA, AC,CA, BC,CB
      const avgWinRate = team.value.reduce((avg, id) => avg + allyData.value[id].contributingWinRate / team.value.length, 0)
      return Math.round(100 * avgWinRate) + '%'
    })

    const notEnoughData = computed(() => Object.values(allyData.value).some(b => !b.sufficientData && !team.value.includes(b.id)))

    return {
      team,
      loading,
      allyData,
      addToTeam,
      clearTeam,
      removeFromTeam,
      teamWinRate,
      notEnoughData,
      faTimes,
    }
  },
})
</script>
