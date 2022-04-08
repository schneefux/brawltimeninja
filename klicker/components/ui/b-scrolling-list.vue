<template>
  <div>
    <ul
      v-if="'preview' in $scopedSlots"
      class="flex md:flex-wrap overflow-x-auto"
    >
      <li
        v-for="(item, index) in items"
        :key="`${index}-${item[keyId]}`"
        :class="{
          'border-white/[.2]': index < state.start || index > state.end - 1,
          'border-y-primary-200': index >= state.start && index <= state.end - 1,
          'border-l-white/[.2]': index > state.start && index <= state.end - 1,
          'border-r-white/[.2]': index >= state.start && index < state.end - 1,
          'border-l-primary-200': index == state.start,
          'border-r-primary-200': index == state.end - 1,
          'border-x-white/[.2]': index < state.start || index > state.end - 1,
        }"
        class="border-y-2 border-x first:border-l-2 last:border-r-2 cursor-pointer empty:hidden"
        @click="scrollTo(index)"
      >
        <slot
          name="preview"
          v-bind="item"
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
        v-if="list.length > 0 && state.start > 0"
        :style="{
          'grid-column-start': 1,
          'grid-column-end': state.start * columnWidths.actualColumnsPerItem + 1,
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
        v-if="list.length > 0 && state.end <= items.length - 1"
        :style="{
          'grid-column-start': state.end * columnWidths.actualColumnsPerItem + 1,
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
  },
  // TODO replace by function ref when migrating to Vue 3
  setup(props, { refs }) {
    const container = ref<InstanceType<typeof BScrollingDashboard>>()

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

    const list = computed(() => props.items
      .slice(state.value.start, state.value.end)
      .map((item, index) => ({
        item,
        index: state.value.start + index,
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

      return {
        actualColumnsPerItem,
        pxPerItem,
        pxGap,
      }
    }
    
    const columnWidths = ref({
      actualColumnsPerItem: props.cellColumns,
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
      if (columnWidths.value == undefined) {
        return
      }

      const { pxPerItem, pxGap } = columnWidths.value

      const pxWholeWidth = container.value!.wrapper!.clientWidth

      const startIndex = (event.x + pxGap) / (pxPerItem + pxGap)
      const endIndex = (event.x + pxWholeWidth + pxGap) / (pxPerItem + pxGap)

      // FIXME workaround for scroll flicker on mobile devices
      scrollSnap.value = false
      clearTimeout(timeout)
      timeout = setTimeout(() => scrollSnap.value = true, 100)

      state.value = {
        start: Math.max(Math.floor(startIndex), 0),
        end: Math.min(Math.ceil(endIndex), props.items.length),
      }
    }

    return {
      onScroll,
      scrollTo,
      container,
      list,
      state,
      scrollSnap,
      columnWidths,
    }
  },
})
</script>
