import { useNuxtApp } from '#imports'
import { KlickerService } from '../types'

// TODO turn the service into a composable, do not depend on Nuxt context
export const useKlicker = () => {
  const $klicker = (<any>useNuxtApp()).$klicker as KlickerService

  const translate = (key: string, args?: any) => $klicker.$t(key, args)

  return {
    $klicker,
    translate,
  }
}
