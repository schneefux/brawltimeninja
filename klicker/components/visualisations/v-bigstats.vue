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
        <dt class="text-gray-200/75">
          {{ row.title }}
        </dt>
        <dd class="text-xl text-gray-200">
          {{ row.value }}
        </dd>
      </dl>
    </div>
  </v-card-wrapper>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue-demi'
import { VisualisationProps } from '../../props'
import { useCubeResponseProps } from '../../composables/response'
import BBigstat from '../ui/b-bigstat.vue'
import VCardWrapper from './v-card-wrapper.vue'

export default defineComponent({
  components: {
    VCardWrapper,
    BBigstat,
  },
  name: 'VBigstats',
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { $klicker, dimensions, metrics, switchResponse } = useCubeResponseProps(props)

    const rows = computed(() => switchResponse(
      response => metrics.value.map(m => ({
        id: m.id,
        title: $klicker.getName(m, 'short'),
        value: response.data[0].metrics[m.id],
      })), response => metrics.value.map(m => ({
        id: m.id,
        title: $klicker.getName(m, 'short'),
        value: response.data[0].metrics[m.id],
      }))
    ))

    return {
      rows,
    }
  },
})
</script>
