<template>
  <event-card
    :mode="mode"
    :loading="$fetchState.pending"
    full-height
  >
    <div
      slot="content"
      class="flex justify-center h-full items-center"
    >
      <div class="flex items-end bg-gray-800 rounded">
        <media-img
          :path="`/brawlers/${brawlerId}/avatar`"
          size="128"
          clazz="w-16 mr-2"
        ></media-img>
        <kv-table
          v-if="modeTable.length > 0"
          :data="modeTable"
          class="w-48 px-3 py-2"
        ></kv-table>
        <div
          v-else
          class="w-48 flex"
          style="height: 112px;"
        >
          <p class="m-auto">{{ $t('state.no-data') }}</p>
        </div>
      </div>
    </div>
  </event-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { MetaGridEntry } from '@schneefux/klicker/types';
import { picksMetric, useRateMetric, winRateMetric } from '~/lib/klicker.conf';

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
    mode: {
      // camel case
      type: String,
      required: true
    },
  },
  data() {
    return {
      modeData: undefined as undefined|MetaGridEntry,
      mapData: [] as MetaGridEntry[],
    }
  },
  watch: {
    brawlerId: '$fetch',
    brawlerName: '$fetch',
    mode: '$fetch',
  },
  fetchDelay: 0,
  fetchOnServer: false,
  async fetch() {
    // TODO use brawler ID

    const modeData = await this.$klicker.query({
      cubeId: 'map',
      slices: {
        mode: [this.mode],
      },
      metricsIds: ['winRate', 'useRate', 'picks'],
      dimensionsIds: ['brawler'],
      sortId: 'picks',
    })
    modeData.data = modeData.data.filter(e => e.dimensionsRaw.brawler.brawler == this.brawlerName.toUpperCase())

    const mapData = await this.$klicker.query({
      cubeId: 'map',
      slices: {
        mode: [this.mode],
      },
      metricsIds: ['winRate', 'useRate'],
      dimensionsIds: ['map', 'brawler'],
      sortId: 'picks',
    })
    mapData.data = mapData.data.filter(e => e.dimensionsRaw.brawler.brawler == this.brawlerName.toUpperCase())

    if (modeData.data.length > 0) {
      this.modeData = modeData.data[0]
    }
    this.mapData = mapData.data
  },
  computed: {
    aboveAverageMaps(): number {
      const compareMaps = (m: MetaGridEntry) => (m.metricsRaw.winRate as number) * (m.metricsRaw.useRate as number) > 0.5 * 1 / this.totalBrawlers
      return this.mapData.filter(m => compareMaps(m)).length
    },
    modeTable(): string[][] {
      if (this.modeData == undefined) {
        return []
      }
      return [
        [ picksMetric.name!, this.$klicker.format(picksMetric, this.modeData.metricsRaw.picks) ],
        [ useRateMetric.name!, this.$klicker.format(useRateMetric, this.modeData.metricsRaw.useRate as number) ],
        [ winRateMetric.name!, this.$klicker.format(winRateMetric, this.modeData.metricsRaw.winRate as number) ],
        [ 'Viable Maps', this.aboveAverageMaps + '/' + this.mapData.length ],
      ]
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
    })
  },
})
</script>
