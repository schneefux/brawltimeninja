<template>
  <card
    :title="formatKind + ': ' + formatName"
    :icon="`/${kind}/${id}`"
    :icon-alt="`${brawlerName}'s ${formatKind} ${formatName}`"
    full-height
    md
  >
    <template v-slot:content>
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
      <kv-table
        class="mt-3"
        :data="statsTable"
      ></kv-table>
    </template>
  </card>
</template>

<script lang="ts">
import Vue from 'vue'
import { commonMeasurements } from '~/lib/cube'
import { capitalize, scaleInto } from '~/lib/util'

export default Vue.extend({
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
      type: Number,
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
        [ 'No ' + this.formatKind + ' ' + commonMeasurements.winRate.name, this.$clicker.format(commonMeasurements.winRate, this.withoutWinRate) ],
        [ this.formatName + ' ' + commonMeasurements.winRate.name, this.$clicker.format(commonMeasurements.winRate, this.winRate) ],
      ]
    },
    gameFileDescription(): string {
      return this.description || ''
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
