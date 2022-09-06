<template>
  <v-card-wrapper
    v-bind="$props"
    :card="card && { ...card, title: translate('comparison.test.info.title') }"
    component="v-test-info"
  >
    <div slot="content">
      <p>{{ translate('comparison.test.info.description', { testName, metricName }) }}</p>
      <table class="mx-auto mt-2">
        <tbody>
          <tr>
            <td class="pr-1">⋆⋆⋆</td>
            <td>{{ translate('comparison.test.very-significant') }}</td>
          </tr>
          <tr>
            <td>⋆⋆</td>
            <td>{{ translate('comparison.test.very-significant') }}</td>
          </tr>
          <tr>
            <td>⋆</td>
            <td>{{ translate('comparison.test.significant') }}</td>
          </tr>
          <tr>
            <td>+</td>
            <td>{{ translate('comparison.test.not-significant') }}</td>
          </tr>
          <tr>
            <td></td>
            <td>{{ translate('comparison.test.not-significant') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </v-card-wrapper>
</template>

<script lang="ts">
import { VisualisationProps } from '../../props'
import { computed, defineComponent } from 'vue'
import { useCubeResponseProps } from '../../composables/response'
import VCardWrapper from './v-card-wrapper.vue'
import { useKlicker } from '../../composables'

export default defineComponent({
  components: {
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { translate } = useKlicker()
    const { $klicker, metrics } = useCubeResponseProps(props)

    const metricName = computed(() => $klicker.getName(metrics.value[0]))
    const testName = computed(() => metrics.value[0].statistics?.test?.name)

    return {
      metricName,
      testName,
      translate,
    }
  },
})
</script>
