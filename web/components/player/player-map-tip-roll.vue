<template>
  <b-shimmer
    v-if="result == undefined"
    slot="placeholder"
    width-px="265"
    height-px="72"
  ></b-shimmer>
  <v-roll
    v-else
    v-bind="{ query: result, ...$attrs }"
  >
    <template v-slot:dimensions="data">
      <d-brawler v-bind="data"></d-brawler>
    </template>
  </v-roll>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { MetaGridEntry, CubeResponse } from '~/klicker'
import { Brawler } from '~/model/Brawlstars'
import { VRoll, BShimmer } from '~/klicker/components'
import DBrawler from '~/components/klicker/d-brawler.vue'

export default Vue.extend({
  components: {
    VRoll,
    BShimmer,
    DBrawler,
  },
  inheritAttrs: false,
  props: {
    mode: {
      type: String,
      required: true
    },
    map: {
      type: String,
      required: true
    },
    playerBrawlers: {
      type: Array as PropType<Brawler[]>,
      required: true
    },
    limit: {
      type: Number,
      default: 3
    },
  },
  data() {
    return {
      result: undefined as undefined|CubeResponse,
    }
  },
  fetchDelay: 0,
  async fetch() {
    const result = await this.$klicker.query({
      cubeId: 'map',
      slices: {
        mode: [this.mode],
        map: [this.map],
      },
      dimensionsIds: ['brawler'],
      measurementsIds: ['winRate'],
      sortId: 'winRate',
    })

    // custom sort function

    // score =
    //   index [ brawlers owned by player, worst first ]
    //     *
    //   index [ brawler in map meta, best first ]
    const worstBrawlers = this.playerBrawlers.slice()
      .sort((b1, b2) => b1.trophies - b2.trophies)
    const bestBrawlers = result.data

    function score(b: MetaGridEntry) {
      const bestBrawlerIndex = bestBrawlers.indexOf(b)
      const worstBrawler = worstBrawlers.find(bb => bb.name == b.dimensionsRaw.brawler.brawler)
      if (worstBrawler == undefined) {
        return 0
      }
      return (worstBrawler.trophies + 1) * (bestBrawlerIndex / bestBrawlers.length + 1)
    }

    result.data = result.data
      .sort((b1, b2) => score(b1) - score(b2))
      .slice(0, this.limit)

    this.result = result
  },
})
</script>
