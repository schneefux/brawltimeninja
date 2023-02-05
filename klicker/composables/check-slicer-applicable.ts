import { computed, Ref } from 'vue'
import { useKlickerConfig } from './klicker'
import { SlicerSpec } from '../types'

export const useCheckSlicerApplicable = (cubeId: Ref<string>) => {
  const { $klicker } = useKlickerConfig()

  const allMetrics = computed(() => {
    if (!(cubeId.value in $klicker.config)) {
      throw 'Invalid cubeId ' + cubeId.value
    }

    return $klicker.config[cubeId.value].metrics
  })

  const allDimensions = computed(() => {
    if (!(cubeId.value in $klicker.config)) {
      throw 'Invalid cubeId ' + cubeId.value
    }

    return $klicker.config[cubeId.value].dimensions
  })

  const checkSlicerApplicable = (spec: SlicerSpec) =>
    spec.applicable(allDimensions.value, cubeId.value)

  return {
    checkSlicerApplicable,
  }
}
