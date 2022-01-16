<template>
  <div class="w-full">
    <v-auto
      v-bind="$props"
      :card="{ loading, fullHeight: true, elevation: 2 }"
      class="w-full dashboard-grid"
      for-grid
      all
    >
      <template
        v-for="(_, name) in $scopedSlots"
        v-slot:[name]="data"
      >
        <slot
          :name="name"
          v-bind="data"
        ></slot>
      </template>
    </v-auto>

    <c-share></c-share>
  </div>
</template>

<script lang="ts">
import { VisualisationProps } from '~/klicker/props'
import CShare from '~/klicker/components/c-share.vue'
import VAuto from '~/klicker/components/visualisations/v-auto.vue'
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  components: {
    VAuto,
    CShare,
  },
  props: {
    ...VisualisationProps,
  },
})
</script>
