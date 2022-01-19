import { computed, Ref, useContext } from '@nuxtjs/composition-api'
import { SlicerSpec } from '~/klicker'

export const useCubeConfig = (cubeId: Ref<string>) => {
  const { $klicker } = useContext()

  const allMeasurements = computed(() => {
    if (!(cubeId.value in $klicker.config)) {
      throw 'Invalid cubeId ' + cubeId.value
    }

    return $klicker.config[cubeId.value].measurements
  })

  const allDimensions = computed(() => {
    if (!(cubeId.value in $klicker.config)) {
      throw 'Invalid cubeId ' + cubeId.value
    }

    return $klicker.config[cubeId.value].dimensions
  })

  const checkSlicerApplicable = (spec: SlicerSpec) =>
    spec.applicable(allDimensions.value, allMeasurements.value)

  return {
    $klicker,
    allMeasurements,
    allDimensions,
    checkSlicerApplicable,
  }
}
