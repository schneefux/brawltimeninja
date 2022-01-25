import { useContext } from '@nuxtjs/composition-api'
import { KlickerService } from '../types'

// TODO turn the service into a composable, do not depend on Nuxt context
export const useKlicker = () => {
  const { $klicker } = useContext()

  return { $klicker } as { $klicker: KlickerService }
}
