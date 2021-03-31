<template>
  <card
    :title="$tc('best.' + kind, 1)"
    :elevation="elevation"
  >
    <b-button
      slot="actions"
      :to="localePath(`/tier-list/${kind}`)"
      primary
      prefetch
      sm
    >
      {{ $t('action.open.tier-list.' + kindKey) }}
    </b-button>

    <c-query
      slot="content"
      :state="{
        cubeId: cubeId,
        dimensionsIds: dimensionIds,
        measurementsIds: ['winRate'],
        slices: {
          /*
          map: map != undefined ? [map] : [],
          mode: mode != undefined ? [mode] : [],
          powerplay: powerplay != undefined ? [powerplay] : [],
          */
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
        <v-roll
          v-bind="{
            ...data,
            ...$attrs,
            elevation: elevation + 1,
          }">
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
import { SliceValue } from '~/lib/cube'

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
      default: 1
    },
  },
  computed: {
    cubeId(): string {
      return this.kind == 'starpowers' ? 'starpower' : 'gadget'
    },
    dimensionIds(): string[] {
      return this.kind == 'starpowers' ? ['starpower'] : ['gadget']
    },
    slices(): SliceValue {
      return {
        [this.kind == 'starpowers' ? 'starpowerIdNeq' : 'gadgetIdNeq']: ['0'],
      }
    },
    kindKey(): string {
      return this.kind == 'starpowers' ? 'starpower' : 'gadget'
    },
  },
})
</script>
