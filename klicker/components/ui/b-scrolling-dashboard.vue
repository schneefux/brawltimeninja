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
      class="absolute left-0 inset-y-0 w-10 -ml-4 flex-col justify-center hidden"
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
        <fa :icon="faChevronLeft"></fa>
      </b-button>
    </div>

    <div
      class="absolute right-0 inset-y-0 w-10 -mr-4 flex-col justify-center hidden"
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
        <fa :icon="faChevronRight"></fa>
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, useTemplateRef } from 'vue'
import Fa from '../fa.vue'
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
    Fa,
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
    const wrapperRef = useTemplateRef<HTMLElement|null>('wrapper')

    const scrollBy = (direction: number) => {
      const rect = wrapperRef.value!.getBoundingClientRect()
      const left = wrapperRef.value!.scrollLeft + rect.width * direction
      wrapperRef.value!.scrollTo({ left, behavior: 'smooth' })
    }

    const scrollLeft = () => scrollBy(-1)
    const scrollRight = () => scrollBy(+1)

    const arrivedLeft = ref<boolean>(true)
    const arrivedRight = ref<boolean>(true)
    const onUpdate = (cause: 'scroll'|'rerender') => requestAnimationFrame(() => {
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

      const scrollable = wrapperRef.value != undefined && wrapperRef.value.scrollWidth > wrapperRef.value.clientWidth
      arrivedLeft.value = scroll.arrivedState.left || !scrollable
      arrivedRight.value = scroll.arrivedState.right || !scrollable
    })

    const scroll = useScroll(wrapperRef, {
      onScroll: () => onUpdate('scroll'),
      offset: {
        left: 50,
        right: 50,
      },
    })

    onMounted(() => onUpdate('rerender'))
    useResizeObserver(wrapperRef, () => onUpdate('rerender'))
    useMutationObserver(wrapperRef, () => onUpdate('rerender'), {
      childList: true,
    })

    return {
      wrapperRef,
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
