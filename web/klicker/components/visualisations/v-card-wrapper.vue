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
import { defineComponent } from '@nuxtjs/composition-api'
import { VisualisationProps } from '~/klicker'
import BCard from '~/klicker/components/ui/b-card.vue'

export default defineComponent({
  components: {
    BCard,
  },
  props: {
    ...VisualisationProps,
    component: {
      type: String,
      required: true
    },
  },
})
</script>
