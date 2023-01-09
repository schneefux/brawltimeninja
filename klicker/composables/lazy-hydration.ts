import { useIntersectionObserver, UseIntersectionObserverOptions } from "@vueuse/core"
import { ref } from "vue"

/**
 * @param lazy: lazy hydration if true, eager hydration if false
 */
export function useLazyHydration(lazy: boolean, intersectionObserverOptions: UseIntersectionObserverOptions) {
  // see also: https://gist.github.com/areknawo/b7673ff99276edd4dee90a0a60b13bfd
  const wrapper = ref<HTMLElement|null>()
  const hydrated = ref(!lazy)

  if (!hydrated.value && !import.meta.env.SSR) {
    const { isSupported, stop } = useIntersectionObserver(wrapper, ([{ isIntersecting }]) => {
      if (isIntersecting) {
        hydrated.value = true
        stop()
      }
    }, intersectionObserverOptions)

    if (!isSupported) {
      hydrated.value = true
    }
  }

  return {
    wrapper,
    hydrated,
  }
}
