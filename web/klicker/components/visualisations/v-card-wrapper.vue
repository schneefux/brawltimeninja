<template>
  <!-- TODO add 'open in dashboard' here -->
  <b-card
    v-if="card"
    v-bind="card"
    :loading="loading"
  >
    <template
      v-for="(_, slot) of $scopedSlots"
      v-slot:[slot]="slotProps"
    >
      <slot
        v-bind="slotProps"
        :name="slot"
      ></slot>
    </template>
  </b-card>
  <div
    v-else
    class="contents"
  >
    <slot name="content"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, useContext } from '@nuxtjs/composition-api'
import { CubeComparingResponse, CubeResponse } from '~/klicker'
import BCard from '~/klicker/components/ui/b-card.vue'
import { useCubeResponse } from '~/klicker/composables/response'

export default defineComponent({
  components: {
    BCard,
  },
  props: {
    card: {
      type: undefined,
      required: false
    },
    response: {
      type: Object as PropType<CubeResponse|CubeComparingResponse>,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    },
    component: {
      type: String,
      required: true
    },
  },
})
</script>
