<template>
  <div>
    <ul
      v-if="'preview' in $scopedSlots"
      ref="preview"
      class="flex overflow-x-auto hide-scrollbar"
    >
      <!-- same layout as b-tabs -->
      <li
        v-for="entry in previewItems"
        :key="`${entry.from}-${entry.item[keyId]}`"
        :class="{
          'border-primary-400 text-gray-200 dark:text-gray-200': entry.from <= state.end && entry.to >= state.start,
          'border-black/[.1] dark:border-white/[.1] hover:border-primary-200 text-gray-800/75 dark:text-gray-200/75 hover:text-gray-200 dark:hover:text-gray-200': !(entry.from <= state.end && entry.to >= state.start),
        }"
        class="block py-2 px-3 whitespace-nowrap transition duration-100 ease-in-out border-b-2 empty:hidden flex-shrink-0 cursor-pointer"
        @click="scrollTo(entry.from)"
      >
        <slot
          name="preview"
          v-bind="entry.item"
        ></slot>
      </li>
    </ul>

    <b-scrolling-dashboard
      ref="container"
      :disable-scroll-snap="!scrollSnap"
      class="mt-4"
      @scroll="onScroll"
    >
      <b-shimmer
        v-if="items.length == 0 && renderPlaceholder"
        :style="{
          'grid-column-start': 1,
          'grid-column-end': columnWidths.actualColumnsPerItem + 1,
          'grid-row-start': `span ${cellRows}`,
          'grid-row-end': `span ${cellRows}`,
        }"
        loading
      ></b-shimmer>

      <b-shimmer
        v-if="list.length > 0 && renderBounds.start > 0"
        :style="{
          'grid-column-start': 1,
          'grid-column-end': renderBounds.start * columnWidths.actualColumnsPerItem + 1,
          'grid-row-start': `span ${cellRows}`,
          'grid-row-end': `span ${cellRows}`,
        }"
        loading
      ></b-shimmer>

      <c-dashboard-cell
        v-for="entry in list"
        :key="`${entry.index}-${entry.item[keyId]}`"
        :ref="`item-${entry.index}`"
        :columns="cellColumns"
        :rows="cellRows"
        :style="{
          'grid-column-start': entry.index * columnWidths.actualColumnsPerItem + 1,
        }"
      >
        <slot
          name="item"
          v-bind="entry.item"
        ></slot>
      </c-dashboard-cell>

      <b-shimmer
        v-if="list.length > 0 && renderBounds.end < items.length - 1"
        :style="{
          'grid-column-start': (renderBounds.end + 1) * columnWidths.actualColumnsPerItem + 1,
          'grid-column-end': items.length * columnWidths.actualColumnsPerItem + 1,
          'grid-row-start': `span ${cellRows}`,
          'grid-row-end': `span ${cellRows}`,
        }"
        loading
      ></b-shimmer>
    </b-scrolling-dashboard>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref } from 'vue-demi'
import BScrollingDashboard from './b-scrolling-dashboard.vue'
import CDashboardCell from '../c-dashboard-cell.vue'
import BShimmer from './b-shimmer.vue'
import { useMutationObserver } from '@vueuse/core'

/**
 * Horizontally-scrolling dashboard with fixed-size, virtually scrolling items
 * Optionally, quicklinks can be rendered via a preview slot
 */
export default defineComponent({
  components: {
    BScrollingDashboard,
    CDashboardCell,
    BShimmer,
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
     * Number of elements to render during SSR
     * More items will be rendered depending on the viewport width.
     */
    renderAtLeast: {
      type: Number,
      default: 0
    },
    /**
     * Render an empty cell to reserve the space and prevent CLS
     */
    renderPlaceholder: {
      type: Boolean,
      default: false
    },
    /**
     * Indices which should render a preview
     */
    previewIndices: {
      type: Array as PropType<number[]>,
      required: false
    },
  },
  // TODO replace by function ref when migrating to Vue 3
  setup(props, { refs }) {
    const container = ref<InstanceType<typeof BScrollingDashboard>>()
    const preview = ref<HTMLElement>()

    const scrollTo = (index: number) => {
      if (container.value?.wrapper == undefined) {
        return
      }

      const { pxPerItem, pxGap } = getColumnWidths()
      const x = index * pxPerItem + index * pxGap
      container.value.wrapper.scrollLeft = x
    }

    /**
     * Track visible elements by index
     */
    const state = ref({
      start: 0,
      end: props.renderAtLeast, // by default, 1 element is visible
    })

    const renderBounds = ref({
      start: 0,
      end: props.renderAtLeast,
    })

    const list = computed(() => props.items
      .slice(renderBounds.value.start, renderBounds.value.end + 1)
      .map((item, index) => ({
        item,
        index: renderBounds.value.start + index,
      }))
    )

    function getColumnWidths() {
      const pxColumnWidth = parseInt(window.getComputedStyle(container.value!.wrapper!)
        .getPropertyValue('grid-auto-columns')
        .replace(/(^.*)(\d+)(.*$)/i, '$2')) // find first number
      const pxGap = parseInt(window.getComputedStyle(container.value!.wrapper!).getPropertyValue('column-gap'))
      let pxPerItem = props.cellColumns * pxColumnWidth + (props.cellColumns - 1) * pxGap
      let actualColumnsPerItem = props.cellColumns

      const firstItem = Object.entries(refs)
        .find(([name, r]) => name.startsWith('item-') && (r as any).length == 1)
      if (firstItem != undefined) {
        const firstItemElement = firstItem[1][0].$el as HTMLElement

        // items may stretch their columns so prefer the actual width over the default values
        pxPerItem = firstItemElement.getBoundingClientRect().width

        // items may be squashed to take up fewer columns on smaller screens
        actualColumnsPerItem = parseInt(window.getComputedStyle(firstItemElement)
          .getPropertyValue('grid-column-end')
          .replace(/(^.*)(\d+)(.*$)/i, '$2'))
      }

      const wrapperComputedStyle = window.getComputedStyle(container.value!.wrapper!)
      const wrapperPaddingLeft = parseInt(wrapperComputedStyle.paddingLeft)
      const wrapperPadding = wrapperPaddingLeft + parseInt(wrapperComputedStyle.paddingRight)

      return {
        actualColumnsPerItem,
        wrapperPaddingLeft,
        wrapperPadding,
        pxPerItem,
        pxGap,
      }
    }
    
    const columnWidths = ref({
      actualColumnsPerItem: props.cellColumns,
      wrapperPaddingLeft: 0,
      wrapperPadding: 0,
      pxPerItem: 1,
      pxGap: 1,
    })
    const updateColumnWidths = () => columnWidths.value = getColumnWidths()
    onMounted(() => {
      updateColumnWidths()
      useMutationObserver(container.value?.wrapper, () => updateColumnWidths(), {
        childList: true,
      })
    })

    const scrollSnap = ref(true)
    let timeout: NodeJS.Timeout

    const onScroll = (event: { x: number, arrivedLeft: boolean, arrivedRight: boolean }) => {
      if (columnWidths.value == undefined || container.value?.wrapper == undefined) {
        return
      }

      const { pxPerItem, pxGap, wrapperPadding, wrapperPaddingLeft } = columnWidths.value

      const pxWholeWidth = container.value.wrapper.clientWidth - wrapperPadding

      const offsetX = event.x - wrapperPaddingLeft
      const startIndex = (offsetX + pxGap) / (pxPerItem + pxGap)
      const endIndex = (offsetX + pxWholeWidth + pxGap) / (pxPerItem + pxGap)

      // FIXME workaround for scroll flicker on mobile devices
      scrollSnap.value = false
      clearTimeout(timeout)
      timeout = setTimeout(() => scrollSnap.value = true, 100)

      // assuming constant scroll speed
      // predict which elements will be relevant in the next scroll event call
      // render them using overscan
      const distance = Math.round(startIndex - state.value.start)
      let overscanLeft = 0
      let overscanRight = 0
      if (distance > 0) {
        overscanRight = distance
      }
      if (distance < 0) {
        overscanLeft = -distance
      }

      state.value = {
        start: Math.max(Math.floor(startIndex), 0),
        end: Math.min(Math.floor(endIndex), props.items.length - 1),
      }
      renderBounds.value = {
        start: Math.max(Math.floor(startIndex - overscanLeft), 0),
        end: Math.min(Math.floor(endIndex + overscanRight), props.items.length - 1),
      }

      if (preview.value != undefined) {
        // scroll preview into view
        const pxPerPreview = preview.value.scrollWidth / props.items.length
        const pxProgress = state.value.start * pxPerPreview
        const centerWidth = preview.value.clientWidth / 2
        const center = preview.value.scrollLeft + centerWidth - pxPerPreview / 2
        const offset = pxProgress - center
        if (Math.abs(offset) > centerWidth / 2) {
          preview.value.scrollLeft += offset
        }
      }
    }

    const previewItems = computed(() => {
      if (props.previewIndices != undefined) {
        return props.previewIndices
          .map((itemIndex, index, all) => ({
            from: itemIndex,
            to: index + 1 <= all.length - 1 ? all[index + 1] - 1 : props.items.length - 1,
            item: props.items[itemIndex],
          }))
      }
      return props.items.map((item, index) => ({
        from: index,
        to: index,
        item,
      }))
    })

    return {
      preview,
      onScroll,
      scrollTo,
      container,
      list,
      state,
      renderBounds,
      scrollSnap,
      columnWidths,
      previewItems,
    }
  },
})
</script>
