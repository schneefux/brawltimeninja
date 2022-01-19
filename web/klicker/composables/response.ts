import { Ref, toRef } from '@nuxtjs/composition-api'
import { CubeComparingResponse, CubeResponse, VisualisationSpec } from '~/klicker'
import { useCubeQuery } from './query'

export const useCubeResponse = (response: Ref<CubeResponse|CubeComparingResponse>) => {
  const useQuery = useCubeQuery(toRef(response.value, 'query'))

  // helper method for typed case differentiation
  const switchResponse = <R1, R2>(
    plainCallback: (r: CubeResponse) => R1,
    comparingCallback: (r: CubeComparingResponse) => R2,
  ) => {
    if (!useQuery.comparing.value) {
      return plainCallback(response.value as CubeResponse)
    } else {
      return comparingCallback(response.value as CubeComparingResponse)
    }
  }

  const checkVisualisationApplicable = (spec: VisualisationSpec) =>
    spec.applicable(useQuery.dimensions.value, useQuery.measurements.value, response.value.data.length || 0, useQuery.comparing.value, response.value.data || [])

  return {
    switchResponse,
    checkVisualisationApplicable,
    ...useQuery,
  }
}

export const useCubeResponseProps = (props: { response: CubeResponse|CubeComparingResponse } ) => {
  return useCubeResponse(toRef(props, 'response'))
}
