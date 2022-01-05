import { computed, useContext } from '@nuxtjs/composition-api'
import { CubeComparingResponse, CubeResponse, VisualisationSpec } from '~/klicker'

export const useCubeResponse = (props: { response?: CubeResponse|CubeComparingResponse }) => {
  const { $klicker } = useContext()

  const comparing = computed(() => props.response?.kind == 'comparingResponse')

  const measurements = computed(() => {
    if (props.response == undefined) {
      return []
    }

    const query = props.response.query

    return query.measurementsIds.map(id => {
      if (!(query.cubeId in $klicker.config)) {
        throw 'Invalid cubeId ' + query.cubeId
      }

      const cube = $klicker.config[query.cubeId]
      const measurement = cube.measurements.find(d => id == d.id)
      if (measurement == undefined) {
        throw new Error('Invalid measurement id ' + id)
      }

      return measurement
    })
  })

  const dimensions = computed(() => {
    if (props.response == undefined) {
      return []
    }

    const query = props.response.query

    return query.dimensionsIds
      .map(id => {
        if (!(query.cubeId in $klicker.config)) {
          throw 'Invalid cubeId ' + query.cubeId
        }

        const cube = $klicker.config[query.cubeId]
        const dimension = cube.dimensions.find(d => id == d.id)
        if (dimension == undefined) {
          throw new Error('Invalid dimension id ' + id)
        }

        return dimension
      })
      // for nested dimensions, return only the lowest level
      .filter(dimension => dimension.childIds == undefined || !query.dimensionsIds.some(id => dimension.childIds!.includes(id)))
  })

  // helper method for typed case differentiation
  const switchResponse = <R1, R2>(
    plainCallback: (r: CubeResponse) => R1,
    comparingCallback: (r: CubeComparingResponse) => R2,
  ) => {
    if (!comparing.value) {
      return plainCallback(props.response as CubeResponse)
    } else {
      return comparingCallback(props.response as CubeComparingResponse)
    }
  }

  const checkApplicable = (spec: VisualisationSpec) =>
    spec.applicable(dimensions.value, measurements.value, props.response?.data.length || 0, comparing.value, props.response?.data || [])

  return {
    $klicker,
    comparing,
    dimensions,
    measurements,
    switchResponse,
    checkApplicable,
  }
}
