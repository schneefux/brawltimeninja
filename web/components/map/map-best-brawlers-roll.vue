<template>
  <card
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
          map: map != undefined ? [map] : [],
          mode: mode != undefined ? [mode] : [],
          powerplay: powerplay != undefined ? [powerplay] : [],
          season: season != undefined ? [season] : [],
        },
        sortId: 'winRate',
      }"
      :limit="limit"
    >
      <shimmer
        slot="placeholder"
        width-px="224"
        height-px="64"
        loading
      ></shimmer>
      <template v-slot="data">
        <v-roll v-bind="{ ...data, ...$attrs, elevation: elevation + 1 }">
          <template v-slot:dimensions="data">
            <d-brawler v-bind="data"></d-brawler>
          </template>
        </v-roll>
      </template>
    </c-query>
  </card>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'

export default Vue.extend({
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
