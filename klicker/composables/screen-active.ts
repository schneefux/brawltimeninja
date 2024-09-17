import { Ref, ref, watchEffect } from "vue"
import { IconDefinition } from '@fortawesome/free-solid-svg-icons'

export interface Screen {
  id: string
  icon: IconDefinition
  name: string
  target: string
  prefix: string
}

export function useActiveScreen(activeRoute: Ref<string>, ignoreRoutePrefix: Ref<string>, screens: Ref<Screen[]>) {
  const active = ref<string>()

  watchEffect(() => {
    const path = activeRoute.value.slice(ignoreRoutePrefix.value.length - 1)

    let longestMatch: Screen|undefined
    let longestMatchLength = 0

    for (const screen of screens.value) {
      const screenUrlLength = screen.prefix.split('/').length
      if (screenUrlLength > longestMatchLength && path.startsWith(screen.prefix)) {
        longestMatch = screen
        longestMatchLength = screenUrlLength
      }
    }

    if (longestMatch != undefined) {
      active.value = longestMatch.id
    }
  })

  return active
}
