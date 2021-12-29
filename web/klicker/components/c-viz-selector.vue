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
import { computed, defineComponent, PropType, useContext } from '@nuxtjs/composition-api'
import { CubeComparingResponse, CubeResponse } from '~/klicker'
import BCard from '~/klicker/components/ui/b-card.vue'
import { useCubeResponse } from '../composables'

export default defineComponent({
  components: {
    BCard,
  },
  props: {
    value: {
      type: String,
      required: true
    },
    response: {
      type: Object as PropType<CubeResponse|CubeComparingResponse>,
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
