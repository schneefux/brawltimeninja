<template>
  <c-query
    :query="{
      cubeId: 'brawler',
      dimensionsIds: ['day'],
      measurementsIds: brawler != undefined ? ['trophies'] : ['playerTrophies'],
      slices: {
        season: [season],
        playerId: [playerId],
        brawler: brawler != undefined ? [brawler.toUpperCase()] : [],
      },
      sortId: 'day',
    }"
  >
    <template v-slot="data">
      <v-lineplot
        v-bind="data"
        :card="card"
      ></v-lineplot>
    </template>

    <template v-slot:empty>
      <slot name="empty"></slot>
    </template>
    <template
      v-if="card"
      v-slot:placeholder
    >
      <b-card
        v-bind="card"
        loading
      >
        <template v-slot:content>
          <slot name="placeholder"></slot>
        </template>
      </b-card>
    </template>
  </c-query>
</template>

<script lang="ts">
import { formatClickhouse, getSeasonEnd, tagToId } from '~/lib/util'
import { subMonths } from 'date-fns'
import { VLineplot } from '@schneefux/klicker/components'
import { computed, defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
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
    },
    playerTag: {
      type: String,
      required: true
    },
    raw: {
      type: Boolean
    },
  },
  setup(props) {
    const d = new Date()
    const season = formatClickhouse(getSeasonEnd(subMonths(d, 3)))

    const playerId = computed(() => tagToId(props.playerTag))

    return {
      season,
      playerId,
    }
  },
})
</script>
