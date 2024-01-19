<template>
  <b-shimmer
    v-if="response == undefined"
    width-px="265"
    height-px="72"
  ></b-shimmer>
  <v-roll
    v-else
    :loading="false"
    :response="response"
  ></v-roll>
</template>

<script lang="ts">
import { MetaGridEntry, CubeResponse } from '@schneefux/klicker/types'
import { Player } from '~/model/Api'
import { VRoll, BShimmer } from '@schneefux/klicker/components'
import { computed, defineComponent, PropType } from 'vue'
import { useAsync } from '~/composables/compat'
import { useKlicker } from '@schneefux/klicker/composables'

export default defineComponent({
  components: {
    VRoll,
    BShimmer,
  },
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
      type: Object as PropType<Player['brawlers']>,
      required: true
    },
    limit: {
      type: Number,
      default: 5
    },
  },
  setup(props) {
    const $klicker = useKlicker()

    const response = useAsync<CubeResponse>(() => $klicker.query({
      cubeId: 'map',
      slices: {
        mode: [props.mode],
        map: [props.map],
      },
      dimensionsIds: ['brawler'],
      metricsIds: ['winRate'],
      sortId: 'winRate',
    }), `player-map-tips-${props.mode}-${props.map}`)

    const trophiesByPlayerBrawler = computed(() => Object.fromEntries(
      Object.values(props.playerBrawlers)
        .map((b) => [b.name, b.trophies])
    ))

    const transformedResponse = computed<CubeResponse|null>(() => {
      if (response.value == null) {
        return null
      }

      const numberOfBrawlers = Object.keys(response.value.data).length
      const globalRanks = Object.fromEntries(
        response.value.data
          .map(r => ({
            name: r.dimensionsRaw.brawler.brawler,
            winRate: r.metricsRaw.winRate as number,
          }))
          .sort((r1, r2) => r2.winRate - r1.winRate)
          .map((r, index) => [r.name, index])
      )

      function score(b: MetaGridEntry) {
        const brawlerName = b.dimensionsRaw.brawler.brawler
        const globalRank = globalRanks[brawlerName]
        const playerBrawlerTrophies = trophiesByPlayerBrawler.value[brawlerName]
        if (playerBrawlerTrophies == undefined) {
          return 0
        }
        return (playerBrawlerTrophies + 1) * (globalRank / numberOfBrawlers + 1)
      }

      const data = response.value.data
        .slice()
        .sort((b1, b2) => score(b1) - score(b2))
        .slice(0, props.limit)

      return {
        kind: response.value.kind,
        query: response.value.query,
        data,
      }
    })

    return {
      response: transformedResponse,
    }
  },
})
</script>
