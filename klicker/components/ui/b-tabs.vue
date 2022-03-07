<template>
  <div
    ref="container"
    class="-mx-4 lg:mx-0"
  >
    <nav
      :class="navClass"
      ref="navContainer"
      role="tablist"
      class="sticky bg-gray-100 dark:bg-gray-900 border-b-2 border-black/[0.10] dark:border-white/[0.10]"
    >
      <ul class="flex px-4 gap-x-8 overflow-x-auto hide-scrollbar">
        <li
          v-for="tab in tabs"
          :key="tab.slot"
        >
          <button
            role="tab"
            class="text-lg px-8 py-2 whitespace-nowrap transition duration-100 ease-in-out"
            :id="`${prefix}-button-${tab.slot}`"
            :class="{
              'border-primary-400 border-b-2': tabVisibility[tab.slot],
              'hover:border-primary-200 hover:border-b-2 text-gray-800/75 dark:text-gray-200/75 hover:text-gray-200 dark:hover:text-gray-200': !tabVisibility[tab.slot],
            }"
            :aria-selected="activeTab == tab.slot ? 'true' : 'false'"
            :aria-controls="`${prefix}-tab-${tab.slot}`"
            @click="setActiveTab(tab)"
          >
            {{ tab.title }}
          </button>
        </li>
      </ul>
    </nav>

    <div
      ref="tabContainer"
      :class="{
        'px-4 scroll-px-4 lg:px-0 lg:scroll-px-0 snap-x snap-mandatory grid auto-cols-[100%] grid-flow-col gap-x-8 overflow-x-auto hide-scrollbar': !vertical,
      }"
    >
      <div
        v-for="tab in tabs"
        :key="tab.slot"
        :ref="tab.slot"
        :class="{
          'snap-center snap-always': !vertical,
          // shrink pages that are outside of the viewport
          // so that the active page does not grow
          'h-screen overflow-y-auto hide-scrollbar': !vertical && tab.slot != activeTab,
        }"
        role="tabpanel"
        :aria-labelledby="`${prefix}-button-${tab.slot}`"
        :id="`${prefix}-tab-${tab.slot}`"
      >
        <slot :name="tab.slot"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue-demi'
import { useIntersectionObserver } from '@vueuse/core'
import { useUniqueId } from '../../composables/id'

interface Tab {
  slot: string
  title: string
}

export default defineComponent({
  props: {
    tabs: {
      type: Array as PropType<Tab[]>,
      required: true
    },
    navClass: {
      type: String,
      default: 'top-0'
    },
    vertical: {
      type: Boolean,
      default: false
    },
  },
  // TODO replace refs by function ref when migrating to Vue 3
  setup(props, { refs }) {
    const container = ref<HTMLElement>()
    const tabContainer = ref<HTMLElement>()
    const navContainer = ref<HTMLElement>()
    const activeTab = ref<string>(props.tabs[0].slot)
    const tabVisibility = ref<Record<string, boolean>>({
      [activeTab.value]: true,
    })

    const scrollUpToTab = (tabElement: HTMLElement, smooth: boolean = false) => {
      const top = tabElement.getBoundingClientRect().top + window.scrollY - navContainer.value!.getBoundingClientRect().bottom
      if (window.scrollY > top) {
        window.scrollTo({ top, behavior: smooth ? 'smooth' : undefined })
      }
    }

    const setActiveTab = (tab: Tab) => {
      const tabElement = refs[tab.slot][0] as HTMLElement
      if (!props.vertical) {
        const left = tabContainer.value!.scrollLeft + tabElement.getBoundingClientRect().left - tabContainer.value!.getBoundingClientRect().left
        tabContainer.value!.scrollTo({ left, behavior: 'smooth' })
      } else {
        scrollUpToTab(tabElement, true)
      }
    }

    onMounted(() => {
      for (const tab of props.tabs) {
        const tabElement = refs[tab.slot][0] as HTMLElement

        useIntersectionObserver(tabElement, ([{ isIntersecting }]) => {
          tabVisibility.value = {
            ...tabVisibility.value,
            [tab.slot]: isIntersecting,
          }
        }, {
          root: !props.vertical ? tabContainer.value : undefined,
          threshold: 0.25,
        })

        useIntersectionObserver(tabElement, ([{ isIntersecting }]) => {
          if (isIntersecting) {
            activeTab.value = tab.slot
            tabVisibility.value = {
              [activeTab.value]: true,
            }

            if (!props.vertical) {
              scrollUpToTab(tabElement)
            }
          }
        }, {
          root: !props.vertical ? tabContainer.value : undefined,
          threshold: 1.0,
        })
      }
    })

    const { id: prefix } = useUniqueId()

    return {
      container,
      tabContainer,
      navContainer,
      setActiveTab,
      activeTab,
      tabVisibility,
      prefix,
    }
  },
})
</script>
