<template>
  <div ref="container">
    <nav
      :class="navClass"
      class="sticky md:static bg-gray-900"
    >
      <ul class="flex mx-6 gap-x-8 overflow-x-auto">
        <li
          v-for="tab in tabs"
          :key="tab.id"
        >
          <button
            class="text-lg px-8 py-2 whitespace-nowrap"
            :class="{
              'border-primary-400 border-b-2': tab.id == activeTab,
              'hover:border-primary-200 hover:border-b-2 text-gray-200/75 hover:text-gray-200': tab.id != activeTab,
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
      class="mt-4 snap-x snap-mandatory flex overflow-x-auto hide-scrollbar"
    >
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :ref="tab.id"
        class="mr-8 w-full flex-shrink-0 snap-center"
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
    const container = ref<HTMLElement|null>(null)
    const tabContainer = ref<HTMLElement|null>(null)
    const activeTab = ref(props.tabs[0].id)

    const setActiveTab = (tab: Tab) => {
      const tabElement = refs[tab.id][0] as HTMLElement
      const left = tabContainer.value!.scrollLeft + tabElement.getBoundingClientRect().left - tabContainer.value!.getBoundingClientRect().left
      tabContainer.value!.scrollTo({ left, behavior: 'smooth' })

      if (container.value!.getBoundingClientRect().top < 0) {
        // TODO does not work
        container.value!.scrollIntoView({ behavior: 'smooth' })
      }
    }

    onMounted(() => {
      for (const tab of props.tabs) {
        if (tab.id in refs && (refs[tab.id] as HTMLElement[]).length > 0) {
          useIntersectionObserver(refs[tab.id][0], ([{ isIntersecting }]) => {
            if (isIntersecting) {
              activeTab.value = tab.id
            }
          })
        }
      }
    })

    return {
      container,
      tabContainer,
      setActiveTab,
      activeTab,
    }
  },
})
</script>

<style lang="postcss">
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
