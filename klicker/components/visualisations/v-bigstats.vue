<template>
  <v-card-wrapper
    v-bind="$props"
    component="v-bigstats"
  >
    <div
      slot="content"
      class="flex flex-wrap gap-8 my-2"
    >
      <dl
        v-for="row in rows"
        :key="row.id"
      >
        <dt class="text-text/75">
          {{ row.title }}
        </dt>
        <dd class="text-xl text-text">
          <m-auto
            :response="response"
            :metric-id="row.metricId"
            :row="row.entry"
          ></m-auto>
        </dd>
      </dl>
    </div>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { VisualisationProps } from '../../props'
import { useCubeResponseProps } from '../../composables/response'
import VCardWrapper from './v-card-wrapper.vue'
import MAuto from './m-auto.vue'

/**
 * Visualisation that prominently displays one or multiple numbers
 *
 * Visually similar to <b-bigstat /> but does not support a lightbox.
 */
export default defineComponent({
  components: {
    VCardWrapper,
    MAuto,
  },
  name: 'VBigstats',
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { $klicker, metrics, switchResponse } = useCubeResponseProps(props)

    const rows = computed(() => switchResponse(
      response => metrics.value.map(m => ({
        id: m.id,
        title: $klicker.getName(m, 'short'),
        metricId: m.id,
        entry: response.data[0],
      })), response => ([{
        id: metrics.value[0].id,
        title: $klicker.getName(metrics.value[0], 'short'),
        metricId: metrics.value[0].id,
        entry: response.data[0],
      }])
    ))

    return {
      rows,
    }
  },
})
</script>
