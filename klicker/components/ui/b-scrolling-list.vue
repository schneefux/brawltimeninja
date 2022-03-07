<template>
  <div>
    <ul
      v-if="'preview' in $scopedSlots"
      class="flex md:flex-wrap overflow-x-auto"
    >
      <li
        v-for="item in items"
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
        class="border-y-2 border-x first:border-l-2 last:border-r-2 cursor-pointer"
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
        v-for="(item, index) in items"
        :key="item[keyId]"
        :ref="item[keyId]"
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
import {computed, defineComponent, onMounted, PropType, ref} from 'vue-demi'
import BScrollingDashboard from './b-scrolling-dashboard.vue'
import CDashboardCell from '../c-dashboard-cell.vue'
import {useIntersectionObserver} from "@vueuse/core";

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
  },
  // TODO replace by function ref when migrating to Vue 3
  setup(props, { refs }) {
    const container = ref<InstanceType<typeof BScrollingDashboard>>()
    const elementVisibility = ref<Record<string, boolean>>({})

    const scrollTo = (id: string) => {
      const element = refs[id][0].$el as HTMLElement
      container.value!.scrollTo(element)
    }

    onMounted((() => {
      for (const item of props.items) {
        const key = item[props.keyId]
        const element = refs[key][0].$el as HTMLElement

        useIntersectionObserver(element, ([{ isIntersecting }]) => {
          elementVisibility.value = {
            ...elementVisibility.value,
            [key]: isIntersecting,
          }
        }, {
          root: container.value!.$el as HTMLElement,
          threshold: 0.0,
        })
      }
    }))

    const visibleIds = computed(() => props.items
      .filter(item => elementVisibility.value[item[props.keyId]])
      .map(item => item[props.keyId])
    )
    const firstVisibleId = computed(() => visibleIds.value[0])
    const lastVisibleId = computed(() => visibleIds.value[visibleIds.value.length - 1])

    return {
      scrollTo,
      container,
      elementVisibility,
      firstVisibleId,
      lastVisibleId,
    }
  },
})
</script>
