<template>
  <b-card
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
      :state="state"
    >
      <b-shimmer
        slot="placeholder"
        width-px="224"
        height-px="64"
        loading
      ></b-shimmer>
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
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, watchEffect } from '@nuxtjs/composition-api'
import { SliceValue, State } from '~/klicker'
import { VRoll, BShimmer, CQuery, BButton } from '~/klicker/components'

export default defineComponent({
  components: {
    VRoll,
    BShimmer,
    CQuery,
    BButton,
  },
  inheritAttrs: false,
  props: {
    kind: {
      type: String as PropType<'starpowers'|'gadgets'>,
      default: 'starpowers'
    },
    slices: {
      type: Object as PropType<SliceValue>,
      default: () => ({})
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
  setup(props) {
    const kindKey = computed(() => props.kind == 'starpowers' ? 'starpower' : 'gadget')
    const state = computed(() => (<State>{
      cubeId: 'battle',
      dimensionsIds: props.kind == 'starpowers' ? ['starpower'] : ['gadget'],
      measurementsIds: ['winRate'],
      slices: {
        ...props.slices,
        [props.kind == 'starpowers' ? 'starpowerIdNeq' : 'gadgetIdNeq']: ['0'],
      },
      sortId: 'winRate',
      limit: props.limit,
    }))

    return {
      state,
      kindKey,
    }
  },
})
</script>
