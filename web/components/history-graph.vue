<template>
  <c-query :query="query">
    <template v-slot="data">
      <v-lineplot
        v-bind="{ ...$attrs, ...data }"
        :card="card"
      >
        <div class="absolute top-2 right-2">
          <history-graph-annotations
            v-if="currentTrophies != undefined"
            v-bind="data"
            :current-trophies="currentTrophies"
          ></history-graph-annotations>
        </div>
      </v-lineplot>
    </template>

    <template v-slot:empty>
      <slot name="empty"></slot>
    </template>
  </c-query>
</template>

<script lang="ts">
import { formatClickhouseDate, getSeasonEnd, tagToId } from '~/lib/util'
import { subMonths } from 'date-fns'
import { VLineplot } from '@schneefux/klicker/components'
import { computed, defineComponent } from 'vue'
import { CubeQuery } from '@schneefux/klicker/types'

export default defineComponent({
  inheritAttrs: false, // can render an empty node, then Vue would complain about leftover attributes
  components: {
    VLineplot,
  },
  props: {
    card: {
      type: undefined,
      required: false
    },
    brawler: {
      type: String,
      required: false
    },
    playerTag: {
      type: String,
      required: true
    },
    currentTrophies: {
      type: Number,
      required: false
    },
  },
  setup(props) {
    const d = new Date()
    const season = formatClickhouseDate(getSeasonEnd(subMonths(d, 3)))

    const playerId = computed(() => tagToId(props.playerTag))

    const query = computed<CubeQuery>(() => ({
      cubeId: 'brawler',
      dimensionsIds: ['day'],
      metricsIds: props.brawler != undefined ? ['trophies'] : ['playerTrophies'],
      slices: {
        season: [season],
        playerId: [playerId.value],
        brawler: props.brawler != undefined ? [props.brawler.toUpperCase()] : [],
      },
      sortId: 'day',
    }))

    return {
      query,
    }
  },
})
</script>
