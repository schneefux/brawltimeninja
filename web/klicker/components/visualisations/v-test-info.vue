<template>
  <b-card
    v-if="show"
    v-bind="$attrs"
    :title="$t('comparison.test.info.title')"
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

    const show = computed(() => comparing.value && measurements.value[0].statistics?.test != undefined)
    const metricName = computed(() => $klicker.getName(measurements.value[0]))
    const testName = computed(() => measurements.value[0].statistics?.test?.name)

    return {
      show,
      metricName,
      testName,
    }
  },
})
</script>
