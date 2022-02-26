<template>
  <event-card
    :mode="mode"
    :loading="modeData == undefined || mapData == undefined"
    full-height
  >
    <div
      v-if="modeData != undefined && mapData != undefined"
      slot="content"
      class="h-full flex flex-col justify-center"
    >
      <brawler-kv-card
        :table="modeTable"
        :brawler-id="brawlerId"
        :brawler-name="brawlerName"
      ></brawler-kv-card>
    </div>
  </event-card>
</template>

<script lang="ts">
import { computed, defineComponent, useAsync, useContext, useStore } from '@nuxtjs/composition-api'
import { MetaGridEntry } from '@schneefux/klicker/types'
import { brawlerId as getBrawlerId } from '@/lib/util'
import { picksMetric, useRateMetric, winRateMetric } from '~/lib/klicker.conf'

export default defineComponent({
  props: {
    brawlerName: {
      type: String,
      required: true
    },
    mode: {
      // camel case
      type: String,
      required: true
    },
  },
  setup(props) {
    const { $klicker, i18n } = useContext()

    const modeData = useAsync(async () => {
      const response = await $klicker.query({
        cubeId: 'map',
        slices: {
          mode: [props.mode],
        },
        metricsIds: ['winRate', 'useRate', 'picks'],
        dimensionsIds: ['brawler'],
        sortId: 'picks',
      })
      const filtered = response.data.filter(e => e.dimensionsRaw.brawler.brawler == props.brawlerName.toUpperCase())

      if (filtered.length > 0) {
        return filtered[0]
      }

      return undefined
    }, `brawler-mode-stats-mode-${props.mode}-${props.brawlerName}`)

    const mapData = useAsync(async () => {
      const response = await $klicker.query({
        cubeId: 'map',
        slices: {
          mode: [props.mode],
        },
        metricsIds: ['winRate', 'useRate'],
        dimensionsIds: ['map', 'brawler'],
        sortId: 'picks',
      })
      return response.data.filter(e => e.dimensionsRaw.brawler.brawler == props.brawlerName.toUpperCase())
    }, `brawler-mode-stats-map-${props.mode}-${props.brawlerName}`)

    const store = useStore<any>()
    const totalBrawlers = computed(() => store.state.totalBrawlers as number)

    const aboveAverageMaps = computed(() => {
      if (mapData.value == undefined) {
        return 0
      }

      const compareMaps = (m: MetaGridEntry) => (m.metricsRaw.winRate as number) * (m.metricsRaw.useRate as number) > 0.5 * 1 / totalBrawlers.value
      return mapData.value.filter(m => compareMaps(m)).length
    })

    const modeTable = computed(() => {
      if (modeData.value == undefined || mapData.value == undefined) {
        return []
      }

      return [
        [ picksMetric.name!, $klicker.format(picksMetric, modeData.value.metricsRaw.picks) ],
        [ useRateMetric.name!, $klicker.format(useRateMetric, modeData.value.metricsRaw.useRate as number) ],
        [ winRateMetric.name!, $klicker.format(winRateMetric, modeData.value.metricsRaw.winRate as number) ],
        [ i18n.t('brawler.viable-maps'), aboveAverageMaps.value + '/' + mapData.value.length ],
      ]
    })

    const brawlerId = computed(() => getBrawlerId({ name: props.brawlerName }))

    return {
      modeData,
      mapData,
      modeTable,
      brawlerId,
    }
  },
})
</script>
