// https://github.com/vueuse/vueuse/blob/main/packages/core/useVirtualList/index.ts
// but for horizontal scrolling
import type { Ref } from 'vue-demi'
import { computed, ref, shallowRef, watch } from 'vue-demi'
import type { MaybeRef } from '@vueuse/shared'
import { useElementSize } from '@vueuse/core'

export interface UseHorizontalVirtualListOptions {
  /**
   * item width, accept a pixel value or a function that returns the width
   *
   * @default 0
   */
  itemWidth: number | ((index: number) => number)
  /**
   * the extra buffer items outside of the view area
   *
   * @default 5
   */
  overscan?: number
}

export interface UseHorizontalVirtualListItem<T> {
  data: T
  index: number
}

export function useHorizontalVirtualList <T = any>(list: MaybeRef<T[]>, options: UseHorizontalVirtualListOptions) {
  const containerRef: Ref = ref<HTMLElement | null>()
  const size = useElementSize(containerRef)

  const currentList: Ref<UseHorizontalVirtualListItem<T>[]> = ref([])
  const source = shallowRef(list)

  const state: Ref = ref({ start: 0, end: 10 })
  const { itemWidth, overscan = 5 } = options

  const getViewCapacity = (containerWidth: number) => {
    if (typeof itemWidth === 'number')
      return Math.ceil(containerWidth / itemWidth)

    const { start = 0 } = state.value
    let sum = 0
    let capacity = 0
    for (let i = start; i < source.value.length; i++) {
      const height = (itemWidth as (index: number) => number)(i)
      sum += height
      if (sum >= containerWidth) {
        capacity = i
        break
      }
    }
    return capacity - start
  }

  const getOffset = (scrollLeft: number) => {
    if (typeof itemWidth === 'number')
      return Math.floor(scrollLeft / itemWidth) + 1

    let sum = 0
    let offset = 0
    for (let i = 0; i < source.value.length; i++) {
      const height = (itemWidth as (index: number) => number)(i)
      sum += height
      if (sum >= scrollLeft) {
        offset = i
        break
      }
    }
    return offset + 1
  }

  const calculateRange = () => {
    const element = containerRef.value
    if (element) {
      const offset = getOffset(element.scrollLeft)
      const viewCapacity = getViewCapacity(element.clientWidth)

      const from = offset - overscan
      const to = offset + viewCapacity + overscan
      state.value = {
        start: from < 0 ? 0 : from,
        end: to > source.value.length
          ? source.value.length
          : to,
      }
      currentList.value = source.value
        .slice(state.value.start, state.value.end)
        .map((ele, index) => ({
          data: ele,
          index: index + state.value.start,
        }))
    }
  }

  watch([size.width, size.height, list], () => {
    calculateRange()
  })

  const totalWidth = computed(() => {
    if (typeof itemWidth === 'number')
      return source.value.length * itemWidth
    return source.value.reduce((sum, _, index) => sum + itemWidth(index), 0)
  })

  const getDistanceLeft = (index: number) => {
    if (typeof itemWidth === 'number') {
      const width = index * itemWidth
      return width
    }
    const width = source.value
      .slice(0, index)
      .reduce((sum, _, i) => sum + itemWidth(i), 0)
    return width
  }

  const scrollTo = (index: number) => {
    if (containerRef.value) {
      containerRef.value.scrollLeft = getDistanceLeft(index)
      calculateRange()
    }
  }

  const offsetLeft = computed(() => getDistanceLeft(state.value.start))
  const wrapperProps = computed(() => {
    return {
      style: {
        height: '100%',
        width: `${totalWidth.value - offsetLeft.value}px`,
        marginLeft: `${offsetLeft.value}px`,
      },
    }
  })

  const containerStyle: Partial<CSSStyleDeclaration> = { overflowX: 'auto' }

  return {
    list: currentList,
    scrollTo,
    containerProps: {
      ref: containerRef,
      onScroll: () => {
        calculateRange()
      },
      style: containerStyle,
    },
    wrapperProps,
  }
}