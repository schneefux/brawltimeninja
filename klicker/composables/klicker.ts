import { useContext } from '@nuxtjs/composition-api'
import { KlickerService } from '../types'

// TODO turn the service into a composable, do not depend on Nuxt context
export const useKlicker = () => {
  const $klicker = useContext().$klicker as KlickerService

  const translate = (key: string, args?: any) => $klicker.$t(key, args)

  return {
    $klicker,
    translate,
  }
}
