import { computed, Ref, toRef } from 'vue-demi'
import { useKlicker } from '../composables/klicker'
import { CubeComparingResponse, CubeResponse, VisualisationSpec } from '../types'

export const useCubeResponse = (response: Ref<CubeResponse|CubeComparingResponse>) => {
  const { $klicker } = useKlicker()

  const comparing = computed(() => response.value.query.comparing == true)

  const config = computed(() => $klicker.findCubeQueryConfiguration(response.value.query))

  const metrics = computed(() => config.value.metrics)

  const dimensions = computed(() => config.value.dimensions
      // for nested dimensions, return only the lowest level
      // TODO I don't remember why
      .filter(dimension => dimension.childIds == undefined || !response.value.query.dimensionsIds.some(id => dimension.childIds!.includes(id)))
  )

  // helper method for typed case differentiation
  const switchResponse = <R1, R2>(
    plainCallback: (r: CubeResponse) => R1,
    comparingCallback: (r: CubeComparingResponse) => R2,
  ) => {
    if (!comparing.value) {
      return plainCallback(response.value as CubeResponse)
    } else {
      return comparingCallback(response.value as CubeComparingResponse)
    }
  }

  const checkVisualisationApplicable = (spec: VisualisationSpec) =>
    spec.applicable(dimensions.value, metrics.value, response.value.data.length || 0, comparing.value, response.value.data || [])

  return {
    $klicker,
    comparing,
    dimensions,
    metrics,
    switchResponse,
    checkVisualisationApplicable,
  }
}

export const useCubeResponseProps = (props: { response: CubeResponse|CubeComparingResponse } ) => {
  return useCubeResponse(toRef(props, 'response'))
}
