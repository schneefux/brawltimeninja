<template>
  <div>
    <ul
      v-if="'preview' in $scopedSlots"
      ref="previewContainer"
      class="flex md:flex-wrap overflow-x-auto"
    >
      <li
        v-for="item in items"
        :ref="`${item[keyId]}-preview`"
        :key="item[keyId]"
        :class="{
          'border-white/[.2]': !elementVisibility[item[keyId]],
          'border-y-primary-200': elementVisibility[item[keyId]],
          'border-l-white/[.2]': elementVisibility[item[keyId]] && item[keyId] != firstVisibleId,
          'border-r-white/[.2]': elementVisibility[item[keyId]] && item[keyId] != lastVisibleId,
          'border-l-primary-200': item[keyId] == firstVisibleId,
          'border-r-primary-200': item[keyId] == lastVisibleId,
          'border-x-white/[.2]': !elementVisibility[item[keyId]],
        }"
        class="border-y-2 border-x first:border-l-2 last:border-r-2 cursor-pointer empty:hidden"
        @click="scrollTo(item[keyId])"
      >
        <slot
          name="preview"
          v-bind="item"
        ></slot>
      </li>
    </ul>

    <b-scrolling-dashboard
      ref="container"
      class="mt-4"
    >
      <c-dashboard-cell
        v-if="items.length == 0 && renderPlaceholder"
        :columns="cellColumns"
        :rows="cellRows"
      ></c-dashboard-cell>

      <c-dashboard-cell
        v-for="(item, index) in items"
        :key="item[keyId]"
        :ref="`${item[keyId]}-item`"
        :columns="cellColumns"
        :rows="cellRows"
        :lazy="eagerUntil == undefined ? false : index > eagerUntil"
      >
        <slot
          name="item"
          v-bind="item"
        ></slot>
      </c-dashboard-cell>
    </b-scrolling-dashboard>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, watch, nextTick } from 'vue-demi'
import BScrollingDashboard from './b-scrolling-dashboard.vue'
import CDashboardCell from '../c-dashboard-cell.vue'
import { useIntersectionObserver } from '@vueuse/core'

/**
 * Horizontally-scrolling dashboard with fixed-size, lazy-loaded items
 * Optionally, quicklinks can be rendered via a preview slot
 */
export default defineComponent({
  components: {
    BScrollingDashboard,
    CDashboardCell,
  },
  props: {
    items: {
      type: Array as PropType<object[]>,
      required: true
    },
    /**
     * Key of a property that uniquely identifies a list element
     */
    keyId: {
      type: String,
      required: true
    },
    /**
     * Height of each rendered list item
     */
    cellRows: {
      type: Number,
      default: 1
    },
    /**
     * Width of each rendered list item
     */
    cellColumns: {
      type: Number,
      required: true
    },
    /**
     * Number of elements to render eagerly
     * Other items will be lazy-loaded.
     * If not set, all elements will be rendered eagerly.
     */
    eagerUntil: {
      type: Number,
      required: false
    },
    /**
     * Render an empty cell to reserve the space and prevent CLS
     */
    renderPlaceholder: {
      type: Boolean,
      default: false
    },
  },
  // TODO replace by function ref when migrating to Vue 3
  setup(props, { refs }) {
    const container = ref<InstanceType<typeof BScrollingDashboard>>()
    const previewContainer = ref<HTMLElement>()
    const elementVisibility = ref<Record<string, boolean>>({})

    const scrollPreviewIntoView = (id: string) => {
      if (!(`${id}-preview` in refs)) {
        return
      }
      const previewElement = refs[`${id}-preview`][0] as HTMLElement

      const offset = previewElement.getBoundingClientRect().left - previewContainer.value!.getBoundingClientRect().left
      const center = previewContainer.value!.clientWidth / 2
      if (offset < center - center / 2 || offset > center + center / 2) {
        const left = previewContainer.value!.scrollLeft + offset - center
        previewContainer.value!.scrollTo({ left, behavior: 'smooth' })
      }
    }

    const scrollTo = (id: string) => {
      const element = refs[`${id}-item`][0].$el as HTMLElement
      container.value!.scrollTo(element)
    }

    const stopCallbacks = ref<(() => void)[]>([])
    const updateObservers = () => {
      const newStopCallbacks: (() => void)[] = []

      for (const item of props.items) {
        const key = item[props.keyId]
        const element = refs[`${key}-item`][0].$el as HTMLElement

        const { stop } = useIntersectionObserver(element, ([{ isIntersecting }]) => {
          elementVisibility.value = {
            ...elementVisibility.value,
            [key]: isIntersecting,
          }

          if (isIntersecting) {
            scrollPreviewIntoView(key)
          }
        }, {
          root: container.value!.$el as HTMLElement,
          threshold: 0.0,
        })

        newStopCallbacks.push(stop)
      }

      stopCallbacks.value.forEach(stop => stop())
      stopCallbacks.value = newStopCallbacks
    }

    onMounted(updateObservers)
    watch(() => [props.items, props.keyId], () => nextTick(updateObservers))

    const visibleIds = computed(() => props.items
      .filter(item => elementVisibility.value[item[props.keyId]])
      .map(item => item[props.keyId])
    )
    const firstVisibleId = computed(() => visibleIds.value[0])
    const lastVisibleId = computed(() => visibleIds.value[visibleIds.value.length - 1])

    return {
      scrollTo,
      previewContainer,
      container,
      elementVisibility,
      firstVisibleId,
      lastVisibleId,
    }
  },
})
</script>
