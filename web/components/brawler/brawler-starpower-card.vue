<template>
  <b-card
    :title="formatKind + ': ' + formatName"
    :icon="`/${kind}/${id}`"
    :icon-alt="`${brawlerName}'s ${formatKind} ${formatName}`"
    full-height
  >
    <template v-slot:icon="data">
      <media-img-icon v-bind="data"></media-img-icon>
    </template>

    <div
      slot="content"
      class="h-full flex flex-col justify-between"
    >
      <p>
        <q
          v-if="gameFileDescription != ''"
          class="italic"
        >{{ gameFileDescription }}</q>
        <template v-if="metaDescription != ''">
          <br>
          {{ metaDescription }}
        </template>
      </p>
      <b-kv-table
        v-if="statsTable.length > 0"
        :rows="[{
          // TODO refactor
          title: statsTable[0][0],
          key: 'without',
        }, {
          title: statsTable[1][0],
          key: 'with',
        }]"
        :data="{
          id: brawlerName,
          without: statsTable[0][1],
          with: statsTable[1][1],
        }"
        id-key="id"
        class="mt-4"
      ></b-kv-table>
    </div>
  </b-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { winRateMetric } from '~/lib/klicker.conf'
import { capitalize, scaleInto } from '~/lib/util'
import { BKvTable } from '@schneefux/klicker/components'

export default Vue.extend({
  components: {
    BKvTable,
  },
  props: {
    kind: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    brawlerName: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    },
    winRate: {
      type: Number
    },
    withoutWinRate: {
      type: Number
    },
    description: {
      type: String
    },
  },
  computed: {
    formatKind(): string {
      return this.kind == 'gadgets' ? 'Gadget' : 'Star Power'
    },
    formatName(): string {
      return capitalize(this.name?.toLowerCase() || '')
    },
    statsTable(): string[][] {
      if (this.winRate == undefined || this.withoutWinRate == undefined) {
        return []
      }

      return [
        [ 'No ' + this.formatKind + ' ' + winRateMetric.name, this.$klicker.format(winRateMetric, this.withoutWinRate) ],
        [ this.formatName + ' ' + winRateMetric.name, this.$klicker.format(winRateMetric, this.winRate) ],
      ]
    },
    gameFileDescription(): string {
      return (this.description || '').replace(/<[^>]*>?/gm, '')
    },
    metaDescription(): string {
      if (this.winRate == undefined || this.withoutWinRate == undefined) {
        return ''
      }

      const diff = this.winRate - this.withoutWinRate
      const differenceTexts = ['has no noticable impact', 'provides a small advantage', 'provides a noticable advantage', 'improves the chances of winning a lot']
      const differenceText = differenceTexts[scaleInto(0, 0.05, differenceTexts.length - 1, diff)]

      return `Looking at the Win Rates, ${this.formatName} ${differenceText}.`
    },
  }
})
</script>
