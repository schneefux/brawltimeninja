import { computed, Ref } from '@vue/composition-api'
import { useKlicker } from './klicker'
import { SlicerSpec } from '../types'

export const useCubeConfig = (cubeId: Ref<string>) => {
  const { $klicker } = useKlicker()

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
    $klicker,
    allMetrics,
    allDimensions,
    checkSlicerApplicable,
  }
}
