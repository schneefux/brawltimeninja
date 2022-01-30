<template>
  <div>
    <div class="grid grid-cols-[minmax(80vw,2fr),minmax(350px,1fr)] lg:grid-cols-[2fr,minmax(350px,1fr)] gap-6 overflow-x-auto -mr-4 pr-4 lg:mr-0 lg:pr-0">
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

    <div class="mt-6 grid grid-flow-col lg:grid-flow-row auto-cols-[minmax(350px,80vw)] lg:grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-6 overflow-x-auto -mr-4 pr-4 lg:mr-0 lg:pr-0">
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
          callback: (v, e) => trackScroll(v, e, 'starpowers'),
          once: true,
        }"
        :brawler-id="brawlerId"
        :brawler-name="brawlerName"
        kind="starpowers"
      ></brawler-starpower-stats>

      <brawler-starpower-stats
        v-observe-visibility="{
          callback: (v, e) => trackScroll(v, e, 'gadgets'),
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
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaGridEntry } from '@schneefux/klicker/types'
import { commonMetrics } from '~/lib/klicker.conf'
import { scaleInto } from '~/lib/util'
import { BrawlerData } from '~/model/Media'

export default Vue.extend({
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
  data() {
    return {
      // game files
      info: undefined as BrawlerData|undefined,
      // klicker data
      data: undefined as MetaGridEntry|undefined,
      totals: undefined as MetaGridEntry|undefined,
    }
  },
  watch: {
    brawlerId: '$fetch',
    brawlerName: '$fetch',
    '$i18n.locale': '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const info = await this.$http.$get<BrawlerData>(`${this.$config.mediaUrl}/brawlers/${this.brawlerId}/${this.$i18n.locale}.json`).catch(() => undefined)
    this.info = info

    const data = await this.$klicker.query({
      cubeId: 'map',
      slices: {
        brawler: [this.brawlerName.toUpperCase()],
      },
      dimensionsIds: [],
      metricsIds: ['winRate', 'starRate', 'useRate'],
      sortId: 'winRate',
    })

    const totalData = await this.$klicker.query({
      cubeId: 'map',
      slices: {},
      dimensionsIds: [],
      metricsIds: ['useRate'],
      sortId: 'winRate',
    })

    // TODO use ID
    this.data = data.data[0]
    this.totals = totalData.data[0]
  },
  computed: {
    gamefileDescription(): string {
      return this.info?.description || ''
    },
    generatedDescription(): string {
      if (this.info == undefined) {
        return ''
      }
      return this.$i18n.t('brawler.description', {
        brawler: this.brawlerName,
        rarity: this.$i18n.t('rarity.' + this.info.rarity) as string,
        class: this.$i18n.t('brawler.class.' + this.info.class) as string,
        unlockCondition: this.info.unlock == undefined ? this.$i18n.t('brawler.unlock.boxes') as string :
          this.info.unlock == 0 ? this.$i18n.t('brawler.unlock.start') as string :
          this.$i18n.t('brawler.unlock.trophies', { trophies : this.info.unlock }) as string,
      }) as string
    },
    statisticsDescription(): string {
      if (this.data == undefined || this.totals == undefined) {
        return ''
      }

      const useRate = (this.data.metricsRaw.useRate as number) / (this.totals.metricsRaw.useRate as number)
      const popularity = scaleInto(0.02, 0.03, 3, useRate)
      const metaness = scaleInto(0.55, 0.60, 4, this.data.metricsRaw.winRate as number)

      return this.$i18n.t('brawler.rating', {
        brawler: this.brawlerName,
        popularity: this.$i18n.t('rating.popularity.' + popularity),
        relative: this.$i18n.t('rating.relative.' + metaness),
      }) as string
    },
    infoTable(): string[][] {
      if (this.info == undefined) {
        return []
      }

      return [
        [ 'Health at Level 1', this.info.health.toString() ],
        [ 'Health at Level 10', Math.round(this.info.health * 1.4).toString() ],
        [ 'Speed', Math.round(this.info.speed * 100) / 100 + 'Tiles/s' ],
      ]
    },
    statsTable(): string[][] {
      if (this.data == undefined || this.totals == undefined) {
        return []
      }

      return [
        [ commonMetrics.useRate.name!, this.$klicker.format(commonMetrics.useRate, (this.data.metricsRaw.useRate as number) / (this.totals.metricsRaw.useRate as number)) ],
        [ commonMetrics.starRate.name!, this.data.metrics.starRate ],
        [ commonMetrics.winRate.name!, this.data.metrics.winRate ],
      ]
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers,
    })
  },
  methods: {
    trackScroll(visible: boolean, element: any, section: string): void {
      if (visible) {
        this.$gtag.event('scroll', {
          'event_category': 'brawler',
          'event_label': section,
        })
      }
    },
  },
})
</script>
