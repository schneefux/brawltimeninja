<template>
  <v-card-wrapper
    v-bind="$props"
    :card="card && { ...card, title: $t('comparison.test.info.title') }"
    component="v-test-info"
  >
    <div slot="content">
      <p>{{ $t('comparison.test.info.description', { testName, metricName }) }}</p>
      <table class="mx-auto mt-2">
        <tbody>
          <tr>
            <td class="pr-1">⋆⋆⋆</td>
            <td>{{ $t('comparison.test.very-significant') }}</td>
          </tr>
          <tr>
            <td>⋆⋆</td>
            <td>{{ $t('comparison.test.very-significant') }}</td>
          </tr>
          <tr>
            <td>⋆</td>
            <td>{{ $t('comparison.test.significant') }}</td>
          </tr>
          <tr>
            <td>+</td>
            <td>{{ $t('comparison.test.not-significant') }}</td>
          </tr>
          <tr>
            <td></td>
            <td>{{ $t('comparison.test.not-significant') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </v-card-wrapper>
</template>

<script lang="ts">
import { VisualisationProps } from '~/klicker'
import { computed, defineComponent } from '@nuxtjs/composition-api'
import { useCubeResponse } from '~/klicker/composables/response'
import VCardWrapper from '~/klicker/components/visualisations/v-card-wrapper.vue'

export default defineComponent({
  components: {
    VCardWrapper,
  },
  props: {
    ...VisualisationProps,
  },
  setup(props) {
    const { $klicker, measurements } = useCubeResponse(props)

    const metricName = computed(() => $klicker.getName(measurements.value[0]))
    const testName = computed(() => measurements.value[0].statistics?.test?.name)

    return {
      metricName,
      testName,
    }
  },
})
</script>
