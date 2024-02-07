<template>
  <div>
    <p class="prose dark:prose-invert text-text/75">
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
          v-if="brawlerMetadata != undefined"
          :mode="row.dimensionsRaw.mode.mode"
          :brawler-metadata="brawlerMetadata"
          class="w-full h-full"
        ></brawler-mode-stats>
      </template>
    </b-scrolling-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { scaleInto } from '~/lib/util'
import { MetaGridEntry } from '@schneefux/klicker/types'
import { BScrollingList } from '@schneefux/klicker/components'
import { useAsync } from '~/composables/compat'
import { useKlicker } from '@schneefux/klicker/composables'
import { useI18n } from 'vue-i18n'
import { PropType } from 'vue'
import { BrawlerMetadata } from '~/composables/dimension-values'

export default defineComponent({
  components: {
    BScrollingList,
  },
  props: {
    brawlerMetadata: {
      type: Object as PropType<BrawlerMetadata>,
      required: false
    },
  },
  setup(props) {
    const $klicker = useKlicker()
    const i18n = useI18n()

    async function fetch() {
      return (await $klicker.query({
        cubeId: 'map',
        slices: {
          brawler: [props.brawlerMetadata!.brawlstarsId],
        },
        dimensionsIds: ['mode'],
        metricsIds: ['winRateAdj'],
        sortId: 'winRateAdj',
      })).data as MetaGridEntry[]
    }

    const data = useAsync(async () => {
      if (props.brawlerMetadata == undefined) {
        return null
      }

      return await fetch()
    }, computed(() => `brawler-modes-${props.brawlerMetadata?.name}`))

    const description = computed(() => {
      if (data.value == undefined || data.value.length == 0 || props.brawlerMetadata == undefined) {
        return ''
      }
      const bestModes = data.value.slice().sort((e1, e2) => (e2.metricsRaw.winRateAdj as number) - (e1.metricsRaw.winRateAdj as number))

      const bestMode = i18n.t('mode.' + bestModes[0].dimensionsRaw.mode.mode)
      const viableModes = bestModes.filter(e => (e.metricsRaw.winRateAdj as number) > 0.55).length
      const viability = scaleInto(0, 1, 3, viableModes / bestModes.length)

      return i18n.t('brawler.modes.description', {
        brawler: props.brawlerMetadata.name,
        amount: i18n.t('rating.amount.' + viability),
        bestMode,
      })
    })

    return {
      data,
      description,
    }
  },
})
</script>
