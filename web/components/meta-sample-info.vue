<template>
  <div class="flex flex-wrap justify-center">
    <card
      v-if="sample != undefined && sample == 0"
      full-height
      dense
    >
      <p
        slot="content"
        class="text-red-400"
      >
        No data!
        Select a different filter.
      </p>
    </card>

    <card
      v-if="sample != undefined"
      title="Sample Size"
      class="w-1/2 md:w-auto"
      full-height
      dense
    >
      <p
        slot="content"
        class="text-lg"
      >
        {{ formatSI(sample) }} Battles
      </p>
    </card>

    <card
      v-if="timestamp != undefined"
      title="Last Update"
      class="w-1/2 md:w-auto"
      full-height
      dense
    >
      <p
        slot="content"
        class="text-lg"
      >
        {{ lastUpdate }}
      </p>
    </card>

    <card
      v-if="timestamp != undefined"
      title="Margin of error"
      class="w-full md:w-auto text-center"
      full-height
      dense
    >
      <p slot="content">
        <span
          :class="['font-semibold text-xl', {
            'text-green-400': moe <= 0.01,
            'text-orange-400': moe > 0.01 && moe <= 0.025,
            'text-red-400': moe > 0.25,
          }]"
        >{{ moePercent }}</span>
        <br>
        <span class="text-sm">
          <template v-if="moe <= 0.005">
            (perfect accuracy)
          </template>
          <template v-if="moe > 0.005 && moe <= 0.01">
            (good accuracy)
          </template>
          <template v-if="moe > 0.01 && moe <= 0.025">
            (mediocre accuracy)
          </template>
          <template v-if="moe > 0.025">
            (poor accuracy)
          </template>
        </span>
      </p>
    </card>
  </div>
</template>

<script lang="ts">
import { formatDistanceToNow, parseISO } from 'date-fns'
import Vue from 'vue'
import { mapState } from 'vuex'
import { formatSI } from '~/lib/util'

export default Vue.extend({
  props: {
    sample: {
      type: Number
    },
    timestamp: {
      type: String
    },
  },
  computed: {
    lastUpdate(): string {
      const timestamp = parseISO(this.timestamp)
      if (timestamp.valueOf() == 0) {
        return 'never'
      }
      return formatDistanceToNow(timestamp, { addSuffix: true })
    },
    moe(): number|undefined {
      if (this.sample == undefined) {
        return undefined
      }
      // margin of error
      // moe = z * standard error
      // for binomial (normal approximation):
      // moe = z * Math.sqrt(p*(1-p)/n)
      // worst case, p=50%
      // best case, n = sample / brawlers
      // (TODO: Assumes we are slicing Brawlers!)
      return 1.68 * Math.sqrt(0.5 * (1 - 0.5) / (this.sample / this.totalBrawlers))
    },
    moePercent(): string|undefined {
      if (this.moe == undefined) {
        return undefined
      }
      return (this.moe * 100).toFixed(2) + '%'
    },
    formatSI() {
      return formatSI
    },
    ...mapState({
      totalBrawlers: (state: any) => state.totalBrawlers as number,
    })
  },
})
</script>
