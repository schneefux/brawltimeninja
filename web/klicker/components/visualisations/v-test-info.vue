<template>
  <b-card
    v-if="show"
    title="Info about statistical tests"
    lg
  >
    <div slot="content" class="mb-2">
      <p>A statistical test is performed on the reference {{ metricName }} and the compared {{ metricName }}. If the result is significant, the difference cannot be explained by chance. Otherwise, there is not enough data and the effect is too small.</p>
      <table class="mx-auto mt-2">
        <tbody>
          <tr>
            <td class="pr-1">⋆⋆⋆</td>
            <td>Very significant</td>
          </tr>
          <tr>
            <td>⋆⋆</td>
            <td>Very significant</td>
          </tr>
          <tr>
            <td>⋆</td>
            <td>Significant</td>
          </tr>
          <tr>
            <td>+</td>
            <td>Not significant</td>
          </tr>
          <tr>
            <td></td>
            <td>Not significant</td>
          </tr>
        </tbody>
      </table>
    </div>
  </b-card>
</template>

<script lang="ts">
import { CubeComparingResponse } from '~/klicker'
import { computed, defineComponent, PropType, toRefs, useContext } from '@nuxtjs/composition-api'
import BCard from '~/klicker/components/ui/b-card.vue'

export default defineComponent({
  components: {
    BCard,
  },
  props: {
    response: {
      type: Object as PropType<CubeComparingResponse>,
      required: true
    },
  },
  setup(props) {
    const { $klicker } = useContext()
    const { response } = toRefs(props)

    const comparingMeasurement = computed(() => $klicker.getComparingMeasurement(response.value.query))
    const show = computed(() => response.value.kind == 'comparingResponse' && comparingMeasurement.value.statistics != undefined)
    const metricName = computed(() => $klicker.getName(comparingMeasurement.value))

    return {
      show,
      metricName,
    }
  },
})
</script>
