<template>
  <div class="flex flex-wrap justify-center w-full md:w-auto">
    <div class="w-full flex justify-center">
      <card full-height xxl>
        <div
          slot="content"
          class="max-w-xl flex flex-wrap md:flex-nowrap justify-center items-center mx-auto md:py-10 md:px-6"
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
      </card>
    </div>

    <template v-if="info != null">
      <brawler-attack-stats-card
        v-for="attack in ['main', 'super']"
        :key="attack"
        :attack="attack"
        :info="info"
      ></brawler-attack-stats-card>
    </template>

    <card
      v-if="data != null"
      :title="$t('brawler.statistics', { brawler: brawlerName })"
      full-height
      md
    >
      <template v-slot:content>
        <p>{{ statisticsDescription }}</p>
        <kv-table
          :data="statsTable"
          class="mt-3"
        ></kv-table>
      </template>
    </card>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { commonMeasurements } from '~/lib/cube'
import { scaleInto } from '~/lib/util'
import { BrawlerData } from '~/model/Media'

interface Row {
  brawler_name: string
  picks_weighted: number
  battle_victory: number
  battle_starplayer: number
}

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
      info: null as BrawlerData|null,
      // clicker data
      data: null as Row|null,
      totals: null as Row|null,
    }
  },
  watch: {
    brawlerId: '$fetch',
    brawlerName: '$fetch',
    '$i18n.locale': '$fetch',
  },
  fetchDelay: 0,
  async fetch() {
    const info = await this.$axios.$get<BrawlerData>(`${process.env.mediaUrl}/brawlers/${this.brawlerId}/${this.$i18n.locale}.json`).catch(() => null)
    this.info = info

    const data = await this.$clicker.query<Row>('meta.brawler.base-stats-widget', 'map',
      ['brawler_name'],
      ['battle_victory', 'battle_starplayer', 'picks_weighted'], {
        ...this.$clicker.defaultSlicesRaw('map'),
        brawler_name: [this.brawlerName.toUpperCase()],
      },
      { sort: { picks: 'desc' }, cache: 60*60 })

    const totalData = await this.$clicker.query<Row>('meta.brawler.base-stats-widget', 'map',
      [],
      ['battle_victory', 'battle_starplayer', 'picks_weighted'], {
        ...this.$clicker.defaultSlicesRaw('map'),
      },
      { sort: { picks: 'desc' }, cache: 60*60 })

    // TODO use ID
    this.data = data.data[0]
    this.totals = totalData.data[0]
  },
  computed: {
    gamefileDescription(): string {
      return this.info?.description || ''
    },
    generatedDescription(): string {
      if (this.info == null) {
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

      const useRate = this.data.picks_weighted / this.totals.picks_weighted
      const popularity = scaleInto(0.02, 0.03, 3, useRate)
      const metaness = scaleInto(0.55, 0.60, 4, this.data.battle_victory)

      return this.$i18n.t('brawler.rating', {
        brawler: this.brawlerName,
        popularity: this.$i18n.t('rating.popularity.' + popularity),
        relative: this.$i18n.t('rating.relative.' + metaness),
      }) as string
    },
    infoTable(): string[][] {
      if (this.info == null) {
        return []
      }

      return [
        [ 'Health at Level 1', this.info.health.toString() ],
        [ 'Health at Level 10', Math.round(this.info.health * 1.4).toString() ],
        [ 'Speed', Math.round(this.info.speed * 100) / 100 + 'Tiles/s' ],
      ]
    },
    statsTable(): string[][] {
      if (this.data == null || this.totals == null) {
        return []
      }

      return [
        [ commonMeasurements.useRate.name, this.$clicker.format(commonMeasurements.useRate, this.data.picks_weighted / this.totals.picks_weighted) ],
        [ commonMeasurements.starRate.name, this.$clicker.format(commonMeasurements.starRate, this.data.battle_starplayer) ],
        [ commonMeasurements.winRate.name, this.$clicker.format(commonMeasurements.winRate, this.data.battle_victory) ],
      ]
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers,
    })
  },
})
</script>
