import { computed, Ref, useContext } from '@nuxtjs/composition-api'
import { CubeComparingQuery, CubeQuery, SlicerSpec } from '~/klicker'

export const useCubeQuery = (query: Ref<CubeQuery|CubeComparingQuery>) => {
  const { $klicker } = useContext()

  const comparing = computed(() => query.value.comparing == true)

  const measurements = computed(() => {
    if (query.value == undefined) {
      return []
    }

    return query.value.measurementsIds.map(id => {
      if (!(query.value.cubeId in $klicker.config)) {
        throw 'Invalid cubeId ' + query.value.cubeId
      }

      const cube = $klicker.config[query.value.cubeId]
      const measurement = cube.measurements.find(d => id == d.id)
      if (measurement == undefined) {
        throw new Error('Invalid measurement id ' + id)
      }

      return measurement
    })
  })

  const dimensions = computed(() => {
    if (query.value == undefined) {
      return []
    }

    return query.value.dimensionsIds
      .map(id => {
        if (!(query.value.cubeId in $klicker.config)) {
          throw 'Invalid cubeId ' + query.value.cubeId
        }

        const cube = $klicker.config[query.value.cubeId]
        const dimension = cube.dimensions.find(d => id == d.id)
        if (dimension == undefined) {
          throw new Error('Invalid dimension id ' + id)
        }

        return dimension
      })
      // for nested dimensions, return only the lowest level
      .filter(dimension => dimension.childIds == undefined || !query.value.dimensionsIds.some(id => dimension.childIds!.includes(id)))
  })

  const checkSlicerApplicable = (spec: SlicerSpec) =>
    spec.applicable(dimensions.value, measurements.value)

  return {
    $klicker,
    comparing,
    dimensions,
    measurements,
    checkSlicerApplicable,
  }
}
