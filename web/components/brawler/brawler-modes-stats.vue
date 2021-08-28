<template>
  <div>
    <p>
      {{ description }}
    </p>
    <horizontal-scroller
      class="mt-2"
      expand-on-desktop
    >
      <lazy
        v-for="(row, index) in data"
        :key="row.dimensionsRaw.mode.mode"
        :render="showAllModes || index <= 2"
        distance="600px"
        class="mx-2"
      >
        <div
          class="w-80"
          style="height: 221px"
          slot="placeholder"
          :class="{
            'md:hidden': !showAllModes && index > 2,
          }"
        ></div>
        <brawler-mode-stats
          :mode="row.dimensionsRaw.mode.mode"
          :brawler-id="brawlerId"
          :brawler-name="brawlerName"
          :class="{
            'md:hidden': !showAllModes && index > 2,
          }"
        ></brawler-mode-stats>
      </lazy>
    </horizontal-scroller>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { MetaGridEntry, scaleInto } from '~/lib/util';

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
    showAllModes: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      data: [] as MetaGridEntry[],
    }
  },
  fetchDelay: 0,
  fetchOnServer: false,
  async fetch() {
    const data = await this.$cube.query({
      cubeId: 'map',
      slices: {
        brawler: [this.brawlerName.toUpperCase()],
      },
      dimensionsIds: ['mode'],
      measurementsIds: ['winRateAdj'],
      sortId: 'winRateAdj',
    })

    this.data = data.data
  },
  computed: {
    description(): string {
      if (this.data.length == 0) {
        return ''
      }
      const bestModes = this.data.slice().sort((e1, e2) => (e2.measurementsRaw.winRateAdj as number) - (e1.measurementsRaw.winRateAdj as number))

      const bestMode = this.$i18n.t('mode.' + bestModes[0].dimensionsRaw.mode.mode)
      const viableModes = bestModes.filter(e => (e.measurementsRaw.winRateAdj as number) > 0.55).length
      const viability = scaleInto(0, 1, 3, viableModes / bestModes.length)

      return this.$i18n.t('brawler.modes.description', {
        brawler: this.brawlerName,
        amount: this.$i18n.t('rating.amount.' + viability),
        bestMode,
      }) as string
    },
  },
});
</script>
