<template>
  <div>
    <v-auto
      v-bind="$props"
      :card="{ loading, fullHeight: true, elevation: 2 }"
      class="w-full grid auto-rows-[minmax(8rem,auto)] md:auto-rows-[minmax(10rem,auto)] grid-cols-1 md:grid-cols-[repeat(auto-fill,14rem)] grid-flow-row-dense"
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
import { VisualisationProps } from '~/klicker'
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

<style lang="postcss" scoped>
.children-flex-auto > * {
  @apply flex-auto;
}
</style>
