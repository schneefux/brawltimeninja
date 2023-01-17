<template>
  <div class="relative">
    <div
      ref="wrapper"
      class="dashboard dashboard--horizontal dashboard--responsive gap-x-8 -mx-4 px-4 scroll-px-4 lg:mx-0 lg:px-0 lg:scroll-px-0 hide-scrollbar"
      :style="{
        'scroll-snap-type': disableScrollSnap ? 'none' : undefined,
      }"
    >
      <slot></slot>
    </div>

    <div
      v-show="!arrivedRight"
      data-testid="scroll-hint-right"
      class="absolute inset-y-0 -right-4 pointer-events-none w-4 bg-gradient-to-r from-transparent to-text/20 z-10 lg:hidden"
    ></div>

    <div
      v-show="!arrivedLeft"
      data-testid="scroll-hint-left"
      class="absolute inset-y-0 -left-4 pointer-events-none w-4 bg-gradient-to-l from-transparent to-text/20 z-10 lg:hidden"
    ></div>

    <div
      class="absolute left-0 inset-y-0 w-10 -ml-5 flex-col justify-center hidden"
      :class="{
        'lg:flex': !arrivedLeft,
      }"
    >
      <b-button
        class="h-10"
        type="button"
        aria-label="previous"
        primary
        round
        @click="scrollLeft()"
      >
        <font-awesome-icon
          :icon="faChevronLeft"
        ></font-awesome-icon>
      </b-button>
    </div>

    <div
      class="absolute right-0 inset-y-0 w-10 -mr-5 flex-col justify-center hidden"
      :class="{
        'lg:flex': !arrivedRight,
      }"
    >
      <b-button
        class="h-10"
        aria-label="next"
        type="button"
        primary
        round
        @click="scrollRight()"
      >
        <font-awesome-icon
          :icon="faChevronRight"
        ></font-awesome-icon>
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import BButton from './b-button.vue'
import { useScroll, useResizeObserver, useMutationObserver } from '@vueuse/core'

export interface ScrollEvent {
  x: number
  arrivedLeft: boolean
  arrivedRight: boolean
}

/**
 * Horizontally-scrolling dashboard that renders scroll hints
 */
export default defineComponent({
  components: {
    FontAwesomeIcon,
    BButton,
  },
  props: {
    disableScrollSnap: {
      type: Boolean,
      default: false
    },
  },
  emits: {
    ['scroll'](value: ScrollEvent) { return true },
    ['rerender'](value: ScrollEvent) { return true },
  },
  setup(props, { emit }) {
    const wrapper = ref<HTMLElement|null>()

    const scrollBy = (direction: number) => {
      const rect = wrapper.value!.getBoundingClientRect()
      const left = wrapper.value!.scrollLeft + rect.width * direction
      wrapper.value!.scrollTo({ left, behavior: 'smooth' })
    }

    const scrollLeft = () => scrollBy(-1)
    const scrollRight = () => scrollBy(+1)

    const arrivedLeft = ref<boolean>(true)
    const arrivedRight = ref<boolean>(true)
    const onUpdate = (cause: 'scroll'|'rerender') => {
      requestAnimationFrame(() => {
        if (cause == 'scroll') {
          emit(cause, {
            x: scroll.x.value,
            arrivedLeft: scroll.arrivedState.left,
            arrivedRight: scroll.arrivedState.right,
          })
        }
        if (cause == 'rerender') {
          emit(cause, {
            x: scroll.x.value,
            arrivedLeft: scroll.arrivedState.left,
            arrivedRight: scroll.arrivedState.right,
          })
        }

        const scrollable = wrapper.value != undefined && wrapper.value.scrollWidth > wrapper.value.clientWidth
        arrivedLeft.value = scroll.arrivedState.left || !scrollable
        arrivedRight.value = scroll.arrivedState.right || !scrollable
      })
    }

    const scroll = useScroll(wrapper, {
      onScroll: () => onUpdate('scroll'),
      offset: {
        left: 50,
        right: 50,
      },
    })

    onMounted(() => onUpdate('rerender'))
    useResizeObserver(wrapper, () => onUpdate('rerender'))
    useMutationObserver(wrapper, () => onUpdate('rerender'), {
      childList: true,
    })

    return {
      wrapper,
      scrollLeft,
      scrollRight,
      arrivedLeft,
      arrivedRight,
      faChevronLeft,
      faChevronRight,
    }
  },
})
</script>
