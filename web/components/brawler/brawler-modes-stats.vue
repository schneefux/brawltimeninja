<template>
  <div>
    <p class="ml-1">
      {{ description }}
    </p>
    <div
      v-if="data != undefined"
      class="mt-6 dashboard dashboard--horizontal md:dashboard--vertical md:dashboard--responsive dashboard--relaxed"
    >
      <lazy
        v-for="(row, index) in data"
        :key="row.dimensionsRaw.mode.mode"
        :render="index <= 2"
        distance="600px"
        :class="['dashboard__cell', {
          'md:hidden': index >= (page + 1) * 3,
        }]"
        style="--rows: 2; --columns: 3;"
      >
        <div slot="placeholder"></div>
        <brawler-mode-stats
          :mode="row.dimensionsRaw.mode.mode"
          :brawler-id="brawlerId"
          :brawler-name="brawlerName"
          class="w-full h-full"
        ></brawler-mode-stats>
      </lazy>
    </div>

    <div class="mt-4 w-full flex justify-end">
      <b-button
        v-if="page > 0"
        class="mx-2"
        primary
        sm
        @click="collapse"
      >
        {{ $t('action.collapse') }}
      </b-button>
      <b-button
        v-if="page < pages"
        class="mx-2"
        primary
        sm
        @click="expand"
      >
        {{ $t('action.expand') }}
      </b-button>
    </div>
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

    const page = ref(0)
    const expand = () => page.value++
    const collapse = () => page.value = 0
    const pages = computed(() => data.value == undefined ? 0 : data.value.length)

    return {
      data,
      description,
      page,
      expand,
      collapse,
      pages,
    }
  },
})
</script>
