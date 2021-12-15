import { computed, useContext, toRef, Ref } from '@nuxtjs/composition-api'
import { CubeComparingResponse, CubeResponse } from '~/klicker'

export const useCubeResponse = (props: { response: CubeResponse|CubeComparingResponse }) => {
  const { $klicker } = useContext()

  const measurements = computed(() => $klicker.getMeasurements(props.response.query))
  const dimensions = computed(() => $klicker.getDimensions(props.response.query))
  const comparing = computed(() => props.response.kind == 'comparingResponse')

  // helper method for typed case differentiation
  const switchResponse = <R1, R2>(
    plainCallback: (r: CubeResponse) => R1,
    comparingCallback: (r: CubeComparingResponse) => R2
  ) => {
    if (comparing.value) {
      return comparingCallback(props.response as CubeComparingResponse)
    } else {
      return plainCallback(props.response as CubeResponse)
    }
  }

  return {
    $klicker,
    comparing,
    dimensions,
    measurements,
    switchResponse,
  }
}
