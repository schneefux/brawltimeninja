<template>
  <div>
    <p class="prose dark:prose-invert text-gray-800/75 dark:text-gray-200/75">
      {{ description }}
    </p>
    <b-scrolling-list
      :items="data != undefined ? data : []"
      :cell-rows="2"
      :cell-columns="3"
      key-id="id"
      class="mt-8"
      render-placeholder
    >
      <template v-slot:item="row">
        <brawler-mode-stats
          :mode="row.dimensionsRaw.mode.mode"
          :brawler-name="brawlerName"
          class="w-full h-full"
        ></brawler-mode-stats>
      </template>
    </b-scrolling-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, useContext, useAsync, computed } from '@nuxtjs/composition-api'
import { scaleInto } from '~/lib/util'
import { MetaGridEntry } from '@schneefux/klicker/types'
import { BScrollingList } from '@schneefux/klicker/components'

export default defineComponent({
  components: {
    BScrollingList,
  },
  props: {
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

    const data = useAsync(() => fetch(), `brawler-modes-${props.brawlerName}`)

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
