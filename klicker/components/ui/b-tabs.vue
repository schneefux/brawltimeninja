<template>
  <div ref="tabContainer">
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

    <transition :name="transition" mode="out-in">
      <div
        :key="activeTab"
        class="mt-4"
      >
        <slot :name="activeTab"></slot>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref, nextTick } from 'vue-demi'

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
  setup(props) {
    const tabContainer = ref<HTMLElement|null>(null)
    const activeTab = ref(props.tabs[0].id)
    const transition = ref('')
    const activeTabIndex = ref(0)

    const setActiveTab = (tab: Tab) => {
      if (tab.id == activeTab.value) {
        return
      }

      activeTab.value = tab.id

      const newIndex = props.tabs.findIndex(t => t.id == tab.id)
      if (newIndex > activeTabIndex.value) {
        transition.value = 'slide-fade-rtl'
      }
      if (newIndex < activeTabIndex.value) {
        transition.value = 'slide-fade-ltr'
      }
      activeTabIndex.value = newIndex

      if (tabContainer.value!.getBoundingClientRect().top < 0) {
        nextTick(() => tabContainer.value!.scrollIntoView())
      }
    }

    return {
      tabContainer,
      setActiveTab,
      transition,
      activeTab,
      activeTabIndex,
    }
  },
})
</script>

<style lang="postcss">
.slide-fade-ltr-enter-active, .slide-fade--ltr-leave-active,
.slide-fade-rtl-enter-active, .slide-fade--rtl-leave-active {
  transition: all .3s ease;
}

.slide-fade-rtl-leave-to,
.slide-fade-ltr-leave-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-fade-rtl-enter {
  transform: translateX(+10rem);
  opacity: 0;
}

.slide-fade-ltr-enter {
  transform: translateX(-10rem);
  opacity: 0;
}
</style>
