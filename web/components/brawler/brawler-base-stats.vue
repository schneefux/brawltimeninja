<template>
  <div>
    <div class="grid grid-cols-[minmax(80vw,2fr),minmax(350px,1fr)] lg:grid-cols-[2fr,minmax(350px,1fr)] gap-8 overflow-x-auto -mr-4 pr-4 lg:mr-0 lg:pr-0">
      <b-card
        class="row-span-2"
        full-height
      >
        <div
          slot="content"
          class="h-full max-w-xl flex flex-wrap md:flex-nowrap justify-center items-center mx-auto md:py-10 md:px-6"
        >
          <div class="w-32 md:w-48 md:pr-6 h-64 flex justify-center items-center">
            <media-img
              :path="'/brawlers/' + brawlerId + '/model'"
              :alt="brawlerName"
              size="500"
            ></media-img>
          </div>
          <div class="w-full">
            <h1 class="text-xl font-semibold mb-3">{{ brawlerName }}</h1>
            <p>
              <q
                v-if="gamefileDescription != ''"
                class="italic"
              >{{ gamefileDescription }}</q>
              <template v-if="generatedDescription != ''">
                <br>
                {{ generatedDescription }}
              </template>
            </p>
            <kv-table
              class="mt-3"
              :data="infoTable"
            ></kv-table>
          </div>
        </div>
      </b-card>

      <template v-if="info != undefined">
        <brawler-attack-stats-card
          v-for="attack in ['main', 'super']"
          :key="attack"
          :attack="attack"
          :info="info"
        ></brawler-attack-stats-card>
      </template>
    </div>

    <div class="mt-8 grid grid-flow-col lg:grid-flow-row auto-cols-[minmax(350px,80vw)] lg:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-8 overflow-x-auto -mr-4 pr-4 lg:mr-0 lg:pr-0">
      <b-card
        v-if="data != undefined"
        :title="$t('brawler.statistics', { brawler: brawlerName })"
        full-height
      >
        <template v-slot:content>
          <p>{{ statisticsDescription }}</p>
          <kv-table
            :data="statsTable"
            class="mt-3"
          ></kv-table>
        </template>
      </b-card>

      <brawler-starpower-stats
        v-observe-visibility="{
          callback: makeVisibilityCallback('starpowers'),
          once: true,
        }"
        :brawler-id="brawlerId"
        :brawler-name="brawlerName"
        kind="starpowers"
      ></brawler-starpower-stats>

      <brawler-starpower-stats
        v-observe-visibility="{
          callback: makeVisibilityCallback('gadgets'),
          once: true,
        }"
        :brawler-id="brawlerId"
        :brawler-name="brawlerName"
        kind="gadgets"
      ></brawler-starpower-stats>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, useAsync, useContext } from '@nuxtjs/composition-api'
import { scaleInto } from '~/lib/util'
import { BrawlerData } from '~/model/Media'
import { starRateMetric, useRateMetric, winRateMetric } from '~/lib/klicker.conf'
import { useTrackScroll } from '~/composables/gtag'

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
    const { $http, $config, i18n, $klicker } = useContext()

    const info = useAsync(() => $http.$get<BrawlerData>(`${$config.mediaUrl}/brawlers/${props.brawlerId}/${i18n.locale}.json`).catch(() => undefined))

    // TODO use ID
    const data = useAsync(async () => {
      const response = await $klicker.query({
        cubeId: 'map',
        slices: {
          brawler: [props.brawlerName.toUpperCase()],
        },
        dimensionsIds: [],
        metricsIds: ['winRate', 'starRate', 'useRate'],
        sortId: 'winRate',
      })

      return response.data[0]
    })

    const totalData = useAsync(async () => {
      const response = await $klicker.query({
        cubeId: 'map',
        slices: {},
        dimensionsIds: [],
        metricsIds: ['useRate'],
        sortId: 'winRate',
      })

      return response.data[0]
    })

    const gamefileDescription = computed(() => info.value?.description || '')

    const generatedDescription = computed(() => {
      if (info.value == undefined) {
        return ''
      }

      return i18n.t('brawler.description', {
        brawler: props.brawlerName,
        rarity: i18n.t('rarity.' + info.value.rarity) as string,
        class: i18n.t('brawler.class.' + info.value.class) as string,
        unlockCondition: info.value.unlock == undefined ? i18n.t('brawler.unlock.boxes') as string :
          info.value.unlock == 0 ? i18n.t('brawler.unlock.start') as string :
          i18n.t('brawler.unlock.trophies', { trophies: info.value.unlock }) as string,
      }) as string
    })

    const statisticsDescription = computed(() => {
      if (data.value == undefined || totalData.value == undefined) {
        return ''
      }

      const useRate = (data.value.metricsRaw.useRate as number) / (totalData.value.metricsRaw.useRate as number)
      const popularity = scaleInto(0.02, 0.03, 3, useRate)
      const metaness = scaleInto(0.55, 0.60, 4, data.value.metricsRaw.winRate as number)

      return i18n.t('brawler.rating', {
        brawler: props.brawlerName,
        popularity: i18n.t('rating.popularity.' + popularity),
        relative: i18n.t('rating.relative.' + metaness),
      }) as string
    })

    const infoTable = computed(() => {
      if (info.value == undefined) {
        return []
      }

      return [
        [ 'Health at Level 1', info.value.health.toString() ],
        [ 'Health at Level 10', Math.round(info.value.health * 1.4).toString() ],
        [ 'Speed', Math.round(info.value.speed * 100) / 100 + 'Tiles/s' ],
      ]
    })

    const statsTable = computed(() => {
      if (data.value == undefined || totalData.value == undefined) {
        return []
      }

      return [
        [ useRateMetric.name!, $klicker.format(useRateMetric, (data.value.metricsRaw.useRate as number) / (totalData.value.metricsRaw.useRate as number)) ],
        [ starRateMetric.name!, data.value.metrics.starRate ],
        [ winRateMetric.name!, data.value.metrics.winRate ],
      ]
    })

    const { makeVisibilityCallback } = useTrackScroll('brawler')

    return {
      info,
      data,
      totalData,
      gamefileDescription,
      generatedDescription,
      statisticsDescription,
      infoTable,
      statsTable,
      makeVisibilityCallback,
    }
  },
})
</script>
