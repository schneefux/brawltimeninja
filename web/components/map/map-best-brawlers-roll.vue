<template>
  <b-card
    :title="$t('best.brawlers.long')"
    :elevation="elevation"
    xxl
  >
    <b-button
      slot="actions"
      :to="localePath(`/tier-list/brawler`)"
      primary
      prefetch
      sm
    >
      {{ $t('action.open.tier-list.brawler') }}
    </b-button>

    <c-query
      slot="content"
      :state="{
        cubeId: 'map',
        dimensionsIds: ['brawler'],
        measurementsIds: ['winRate'],
        slices: {
          map: [map],
          mode: [mode],
          powerplay: [powerplay],
          season: [season],
        },
        sortId: 'winRate',
      }"
      :limit="limit"
    >
      <b-shimmer
        slot="placeholder"
        width-px="224"
        height-px="64"
        loading
      ></b-shimmer>
      <template v-slot="data">
        <v-roll v-bind="{ ...data, ...$attrs, elevation: elevation + 1 }">
          <template v-slot:dimensions="data">
            <d-brawler v-bind="data"></d-brawler>
          </template>
        </v-roll>
      </template>
    </c-query>
  </b-card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { VRoll, BShimmer, BButton, CQuery } from '~/klicker/components'

export default Vue.extend({
  components: {
    VRoll,
    BShimmer,
    BButton,
    CQuery,
  },
  inheritAttrs: false,
  props: {
    kind: {
      type: String as PropType<'starpowers'|'gadgets'>,
      default: 'starpowers'
    },
    map: {
      type: String,
    },
    mode: {
      type: String,
    },
    season: {
      type: String,
    },
    powerplay: {
      type: Boolean,
    },
    limit: {
      type: Number,
      default: 3
    },
    elevation: {
      type: Number,
      default: 2
    },
  },
})
</script>
