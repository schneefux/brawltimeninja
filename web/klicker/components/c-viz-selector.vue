<template>
  <b-card title="Select a Visualisation">
    <div slot="content">
      <ul>
        <li
          v-for="v in visualisations"
          :key="v.component"
          :class="{
            'font-bold': value == v.component,
          }"
          @click="$emit('input', v.component)"
        >{{ v.name }}</li>
      </ul>
    </div>
  </b-card>
</template>

<script lang="ts">
import { computed, defineComponent, useContext } from '@nuxtjs/composition-api'
import { VisualisationProps } from '~/klicker'
import BCard from '~/klicker/components/ui/b-card.vue'
import { useCubeResponse } from '../composables'

export default defineComponent({
  components: {
    BCard,
  },
  props: {
    ...VisualisationProps,
    value: {
      type: String,
      required: true
    },
  },
  setup(props) {
    const { $klicker } = useContext()
    const { measurements, dimensions, comparing } = useCubeResponse(props)

    const visualisations = computed(() => $klicker.visualisations.filter(v =>
      v.applicable(dimensions.value, measurements.value, props.response.data.length, comparing.value, props.response.data)
    ))

    return {
      visualisations,
    }
  },
})
</script>
