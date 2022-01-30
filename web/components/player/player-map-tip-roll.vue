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
    :card="{ elevation }"
  >
    <template v-slot:dimensions="data">
      <d-brawler v-bind="data"></d-brawler>
    </template>
  </v-roll>
</template>

<script lang="ts">
import { MetaGridEntry, CubeResponse } from '@schneefux/klicker/types'
import { Brawler } from '~/model/Brawlstars'
import { VRoll, BShimmer } from '@schneefux/klicker/components'
import DBrawler from '~/components/klicker/d-brawler.vue'
import { computed, defineComponent, PropType, useAsync, useContext } from '@nuxtjs/composition-api'

export default defineComponent({
  components: {
    VRoll,
    BShimmer,
    DBrawler,
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
      type: Array as PropType<Brawler[]>,
      required: true
    },
    limit: {
      type: Number,
      default: 3
    },
    elevation: {
      type: Number
    },
  },
  setup(props) {
    const { $klicker } = useContext()

    const response = useAsync<CubeResponse>(() => $klicker.query({
      cubeId: 'map',
      slices: {
        mode: [props.mode],
        map: [props.map],
      },
      dimensionsIds: ['brawler'],
      metricsIds: ['winRate'],
      sortId: 'winRate',
    }))

    const transformedResponse = computed<CubeResponse|null>(() => {
      if (response.value == null) {
        return null
      }

      // custom sort function

      // score =
      //   index [ brawlers owned by player, worst first ]
      //     *
      //   index [ brawler in map meta, best first ]
      const worstBrawlers = props.playerBrawlers.slice()
        .sort((b1, b2) => b1.trophies - b2.trophies)
      const bestBrawlers = response.value.data

      function score(b: MetaGridEntry) {
        const bestBrawlerIndex = bestBrawlers.indexOf(b)
        const worstBrawler = worstBrawlers.find(bb => bb.name == b.dimensionsRaw.brawler.brawler)
        if (worstBrawler == undefined) {
          return 0
        }
        return (worstBrawler.trophies + 1) * (bestBrawlerIndex / bestBrawlers.length + 1)
      }

      const data = response.value.data
        .slice()
        .sort((b1, b2) => score(b1) - score(b2))
        .slice(0, props.limit)

      return {
        ...response.value,
        loading: false,
        data,
      }
    })

    return {
      response: transformedResponse,
    }
  },
})
</script>
