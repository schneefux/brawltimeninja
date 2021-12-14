<template>
  <b-card md>
    <div slot="content" class="my-2">
      <p>A statistical test is performed on the reference {{ metricName }} and the compared {{ metricName }}. A significant result means that the difference cannot be explained by chance.</p>
      <p>Key:</p>
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

    const metricName = computed(() => $klicker.getName($klicker.getComparingMeasurement(response.value.query)))

    return {
      metricName,
    }
  },
})
</script>
