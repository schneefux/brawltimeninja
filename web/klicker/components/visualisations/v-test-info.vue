<template>
  <b-card
    v-if="show"
    v-bind="$attrs"
    title="Info about statistical tests"
  >
    <div slot="content">
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
import { computed, defineComponent, PropType } from '@nuxtjs/composition-api'
import BCard from '~/klicker/components/ui/b-card.vue'
import { useCubeResponse } from '~/klicker/composables/response'

export default defineComponent({
  components: {
    BCard,
  },
  inheritAttrs: false,
  props: {
    response: {
      type: Object as PropType<CubeComparingResponse>,
      required: true
    },
  },
  setup(props) {
    const { $klicker, comparing, measurements } = useCubeResponse(props)

    const show = computed(() => comparing.value && measurements.value[0].statistics != undefined)
    const metricName = computed(() => $klicker.getName(measurements.value[0]))

    return {
      show,
      metricName,
    }
  },
})
</script>
