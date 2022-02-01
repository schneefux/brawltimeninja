<template>
  <div>
    <p class="prose prose-invert">
      {{ description }}
    </p>
    <scrolling-dashboard
      v-if="data != undefined"
      :length="data.length"
      class="mt-8"
    >
      <template v-slot="{ limit }">
        <lazy
          v-for="(row, index) in data"
          :key="row.dimensionsRaw.mode.mode"
          :render="index <= 2"
          :class="{
            'lg:hidden': index >= limit,
          }"
          distance="600px"
          class="dashboard__cell"
          style="--rows: 2; --columns: 4;"
        >
          <div slot="placeholder"></div>
          <brawler-mode-stats
            :mode="row.dimensionsRaw.mode.mode"
            :brawler-id="brawlerId"
            :brawler-name="brawlerName"
            class="w-full h-full"
          ></brawler-mode-stats>
        </lazy>
      </template>
    </scrolling-dashboard>
  </div>
</template>

<script lang="ts">
import { defineComponent, useContext, useAsync, computed, ref } from '@nuxtjs/composition-api'
import { scaleInto } from '~/lib/util'
import { MetaGridEntry } from '@schneefux/klicker/types'

export default defineComponent({
  props: {
    brawlerId: {
      type: String,
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
  },
  setup(props) {
    const { $klicker, i18n } = useContext()

    async function fetch() {
      return (await $klicker.query({
        cubeId: 'map',
        slices: {
          brawler: [props.brawlerName.toUpperCase()],
        },
        dimensionsIds: ['mode'],
        metricsIds: ['winRateAdj'],
        sortId: 'winRateAdj',
      })).data as MetaGridEntry[]
    }

    const data = useAsync(() => fetch())

    const description = computed(() => {
      if (data.value == undefined) {
        return ''
      }
      const bestModes = data.value.slice().sort((e1, e2) => (e2.metricsRaw.winRateAdj as number) - (e1.metricsRaw.winRateAdj as number))

      const bestMode = i18n.t('mode.' + bestModes[0].dimensionsRaw.mode.mode)
      const viableModes = bestModes.filter(e => (e.metricsRaw.winRateAdj as number) > 0.55).length
      const viability = scaleInto(0, 1, 3, viableModes / bestModes.length)

      return i18n.t('brawler.modes.description', {
        brawler: props.brawlerName,
        amount: i18n.t('rating.amount.' + viability),
        bestMode,
      }) as string
    })

    return {
      data,
      description,
    }
  },
})
</script>
