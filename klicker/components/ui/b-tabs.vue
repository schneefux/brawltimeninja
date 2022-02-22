<template>
  <div ref="container">
    <nav
      :class="navClass"
      class="sticky bg-gray-100 dark:bg-gray-900 border-b-2 border-black/[0.10] dark:border-white/[0.10]"
    >
      <ul class="flex mx-6 gap-x-8 overflow-x-auto">
        <li
          v-for="tab in tabs"
          :key="tab.id"
        >
          <button
            class="text-lg px-8 py-2 whitespace-nowrap transition duration-100 ease-in-out"
            :class="{
              'border-primary-400 border-b-2': tab.id == activeTab || tabVisibility[tab.id],
              'hover:border-primary-200 hover:border-b-2 text-gray-800/75 dark:text-gray-200/75 hover:text-gray-200 dark:hover:text-gray-200': !(tab.id == activeTab || tabVisibility[tab.id]),
            }"
            @click="setActiveTab(tab)"
          >
            {{ tab.title }}
          </button>
        </li>
      </ul>
    </nav>

    <div
      ref="tabContainer"
      class="mt-4 snap-x snap-mandatory grid auto-cols-[100%] grid-flow-col gap-x-8 overflow-x-auto hide-scrollbar"
    >
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :ref="tab.id"
        :class="{
          // shrink pages that are outside of the viewport
          // so that the active page does not grow
          'h-screen overflow-y-auto hide-scrollbar': tab.id != activeTab,
        }"
        class="snap-center snap-always"
      >
        <slot :name="tab.id"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue-demi'
import { useIntersectionObserver } from '@vueuse/core'

interface Tab {
  id: string
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
  },
  // TODO replace refs by function ref when migrating to Vue 3
  setup(props, { refs }) {
    const container = ref<HTMLElement|null>()
    const tabContainer = ref<HTMLElement|null>()
    const activeTab = ref<string>(props.tabs[0].id)
    const tabVisibility = ref<Record<string, boolean>>({
      [activeTab.value]: true,
    })

    const setActiveTab = (tab: Tab) => {
      const tabElement = refs[tab.id][0] as HTMLElement
      const left = tabContainer.value!.scrollLeft + tabElement.getBoundingClientRect().left - tabContainer.value!.getBoundingClientRect().left
      tabContainer.value!.scrollTo({ left, behavior: 'smooth' })
    }

    onMounted(() => {
      for (const tab of props.tabs) {
        const tabElement = refs[tab.id][0] as HTMLElement

        useIntersectionObserver(tabElement, ([{ isIntersecting }]) => {
          tabVisibility.value = {
            ...tabVisibility.value,
            [tab.id]: isIntersecting,
          }
        }, {
          root: container.value,
          threshold: 0.25,
        })

        useIntersectionObserver(tabElement, ([{ isIntersecting }]) => {
          if (isIntersecting) {
            activeTab.value = tab.id

            if (container.value!.getBoundingClientRect().top < 0) {
              container.value!.scrollIntoView()
            }
          }
        }, {
          root: container.value,
          threshold: 1.0,
        })
      }
    })

    return {
      container,
      tabContainer,
      setActiveTab,
      activeTab,
      tabVisibility,
    }
  },
})
</script>
