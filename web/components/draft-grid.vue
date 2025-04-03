<template>
  <div>
    <b-card :title="$t('draft-tool.selected-team')">
      <template v-slot:content>
        <div>
          <p>
            <template v-if="team.length == 0">
              {{ $t('draft-tool.none-selected') }}
            </template>
            <template v-else-if="teamWinRate != undefined">
              {{ $t('draft-tool.estimated.win-rate')}}: <span class="font-semibold">{{ teamWinRate }}</span>
            </template>
            <template v-if="notEnoughData">
              <br>{{ $t('draft-tool.not-enough-data') }}
            </template>
          </p>

          <div class="h-12 md:h-16 flex justify-center mx-2 my-3 space-x-2">
            <button
              v-for="brawler in team"
              :key="brawler.id"
              @click="removeFromTeam(brawler)"
            >
              <media-img
                :path="`/brawlers/${brawler.id}/avatar`"
                :alt="brawler.brawlerName"
                size="160"
                clazz="rounded-md w-12 md:w-16"
              ></media-img>
            </button>

            <b-button
              v-show="team.length > 0"
              class="mb-auto"
              primary
              round
              xs
              @click="clearTeam()"
            >
              <fa :icon="faTimes"></fa>
            </b-button>
          </div>
        </div>
      </template>
    </b-card>

    <b-card
      :title="$t('draft-tool.grid-title')"
      :loading="loading > 0"
      class="mt-8"
    >
      <template v-slot:content>
        <div class="mt-1 mb-3 grid grid-cols-6 md:grid-cols-8 gap-2">
          <button
            v-for="brawler in allyData"
            :key="brawler.id"
            :class="['relative border-2 border-gray-800 shadow-md rounded-md', {
              'opacity-50': !brawler.selectable,
            }]"
            @click="addToTeam(brawler)"
          >
            <media-img
              :path="`/brawlers/${brawler.id}/avatar`"
              :alt="brawler.brawlerName"
              size="160"
              clazz="rounded-xs"
            ></media-img>
            <span
              v-if="brawler.selectable"
              class="absolute bottom-0 right-0 px-1 bg-gray-800/80 leading-tight text-sm md:text-base rounded-br-sm"
              :class="{
                'text-red-400': brawler.normContributingWinRate < 0.33,
                'text-green-400': brawler.normContributingWinRate >= 0.66,
              }"
            >
              {{ brawler.contributingWinRateFormatted }}
            </span>
          </button>
        </div>
      </template>
    </b-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { computed, PropType, ref } from 'vue'
import { CubeQuery } from '@schneefux/klicker/types'
import { brawlerId, capitalizeWords } from '~/lib/util'
import { BCard, Fa } from '@schneefux/klicker/components'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import buildTeamWinratePredictor from '~/lib/klicker.ml'
import { useKlicker } from '@schneefux/klicker/composables'
import { useAsync } from '~/composables/compat'

interface AllyData {
  id: string
  brawler: string
  brawlerName: string
  contributingWinRate: number
  contributingWinRateFormatted: string
  normContributingWinRate: number
  sufficientData: boolean
  selectable: boolean
}

interface SelectedBrawler {
  id: string
  brawler: string
  brawlerName: string
}

export default defineComponent({
  components: {
    BCard,
    Fa,
  },
  props: {
    query: {
      type: Object as PropType<CubeQuery>,
      required: true,
    },
  },
  setup(props) {
    const $klicker = useKlicker()

    const team = ref<SelectedBrawler[]>([])
    const loading = ref(0)

    async function getBrawlerData() {
      loading.value++
      const data = await $klicker.query({
        cubeId: 'battle',
        slices: props.query.slices,
        dimensionsIds: ['brawler'],
        metricsIds: ['winRate', 'picks'],
        sortId: 'winRate',
      })
      loading.value--
      return data
    }

    async function getSynergyData() {
      loading.value++
      const data = await $klicker.query({
        cubeId: 'brawlerAllies',
        slices: props.query.slices,
        dimensionsIds: ['brawler', 'ally'],
        metricsIds: ['winRate', 'picks'],
        sortId: 'winRate',
      })
      loading.value--
      return data
    }

    const brawlerData = useAsync(getBrawlerData,
      computed(() => `draft-grid-brawler-data-${JSON.stringify(props.query.slices)}`))
    const synergyData = useAsync(getSynergyData,
      computed(() => `draft-grid-synergy-data-${JSON.stringify(props.query.slices)}`))

    const winrateModel = computed(() => {
      if (synergyData.value == undefined) {
        return undefined
      }

      return buildTeamWinratePredictor(synergyData.value, team.value.length + 1)
    })

    const picksThreshold = 30
    const allyData = computed(() => {
      const contributingWinRatesByBrawler: Record<string, number> = {}
      const picksByBrawler: Record<string, number> = {}

      if (brawlerData.value == undefined || winrateModel.value == undefined) {
        return {}
      }

      brawlerData.value.data.forEach(row => {
        const name = row.dimensionsRaw.brawler.brawler
        const winRate = winrateModel.value!.predict('victory', [...team.value.map(e => e.brawler), name])
        const picks = row.metricsRaw.picks as number
        contributingWinRatesByBrawler[name] = winRate
        picksByBrawler[name] = picks
      })

      const newAllyData: AllyData[] = []
      for (const [brawler, contributingWinRate] of Object.entries(contributingWinRatesByBrawler)) {
        const sufficientData = picksByBrawler[brawler] > picksThreshold

        const id = brawlerId({ name: brawler })
        newAllyData.push({
          id,
          contributingWinRate,
          brawler,
          brawlerName: capitalizeWords(brawler),
          contributingWinRateFormatted: sufficientData ? `${Math.round(100*contributingWinRate)}%` : '?',
          normContributingWinRate: contributingWinRate,
          sufficientData,
          selectable: sufficientData && !team.value.some(e => e.id == id) && team.value.length < 3,
        })
      }
      const min = newAllyData.reduce((min, brawler) => Math.min(min, brawler.contributingWinRate), Infinity)
      const max = newAllyData.reduce((max, brawler) => Math.max(max, brawler.contributingWinRate), 0)
      newAllyData.forEach(brawler => brawler.normContributingWinRate = (brawler.contributingWinRate - min) / (max - min))
      newAllyData.sort((b1, b2) => b1.id < b2.id ? -1 : 1)

      const map: Record<string, AllyData> = {}
      newAllyData.forEach(b => map[b.id] = b)
      return map
    })

    const addToTeam = (entry: AllyData) => {
      const existing = team.value.find(v => v.id == entry.id)
      if (existing != undefined) {
        removeFromTeam(entry)
        return
      }

      if (!allyData.value[entry.id].selectable) {
        return
      }

      team.value.push({
        id: entry.id,
        brawlerName: entry.brawlerName,
        brawler: entry.brawler,
      })
    }

    const removeFromTeam = (entry: SelectedBrawler) => team.value = team.value.filter(e => e != entry)
    const clearTeam = () => team.value = []

    const teamWinRate = computed(() => {
      if (team.value.length < 3 || winrateModel.value == undefined) {
        return undefined
      }
      return Math.round(100 * winrateModel.value.predict('victory', team.value.map(e => e.brawler))) + '%'
    })

    const notEnoughData = computed(() => Object.values(allyData.value)
      .some(b => !b.sufficientData && !team.value.some(e => e.id == b.id)))

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
