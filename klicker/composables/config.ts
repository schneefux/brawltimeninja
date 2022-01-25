import { computed, Ref } from 'vue-demi'
import { useKlicker } from './klicker'
import { SlicerSpec } from '../types'

export const useCubeConfig = (cubeId: Ref<string>) => {
  const { $klicker } = useKlicker()

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
    spec.applicable(allDimensions.value, allMeasurements.value, cubeId.value)

  return {
    $klicker,
    allMeasurements,
    allDimensions,
    checkSlicerApplicable,
  }
}
