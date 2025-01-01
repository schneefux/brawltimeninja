import { BigstatProps, CardProps } from "props"
import { computed, MaybeRef, Ref, unref } from "vue"
import BCard from '../components/ui/b-card.vue'
import BBigstat from '../components/ui/b-bigstat.vue'
import BDiv from '../components/ui/b-div.vue'

export const vwrappers = {
  BCard,
  BBigstat,
  BDiv,
} as const

/**
 * Visualisation component that wraps another one in a <b-card>, if the card prop is set.
 * Should be used internally to build visualisation components.
 */
export function useVWrapper(card: Ref<CardProps|BigstatProps|false|undefined>, loading: Ref<boolean>, wrapper?: MaybeRef<string|undefined>) {
  return computed(() => {
    if (card.value != undefined && card.value !== false) {
      return {
        is: unref(wrapper) ?? 'b-card',
        props: {
          ...card.value,
          loading: loading.value,
        },
      }
    } else {
      return {
        is: 'b-div',
        props: {},
      }
    }
  })
}
