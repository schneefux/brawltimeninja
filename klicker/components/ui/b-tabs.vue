<template>
  <div class="-mx-4 lg:mx-0">
    <nav
      :class="navClass"
      ref="navContainer"
      role="tablist"
      class="sticky"
    >
      <ul
        ref="headerContainer"
        class="flex overflow-x-auto scrollbar:hidden bg-background"
      >
        <li
          v-for="tab in tabs"
          :ref="el => setHeaderRef(tab.slot, el as HTMLElement|null)"
          :key="tab.slot"
        >
          <!-- same layout as b-scrolling-list preview -->
          <a
            :id="`${prefix}-button-${tab.slot}`"
            :href="`#${prefix}-tab-${tab.slot}`"
            :aria-controls="`${prefix}-tab-${tab.slot}`"
            :class="{
              'border-primary-400 text-text': tabVisibility[tab.slot],
              'border-contrast/[.1] hover:border-primary-200 text-text/75 hover:text-text': !tabVisibility[tab.slot],
            }"
            :aria-selected="activeTab == tab.slot ? 'true' : 'false'"
            role="tab"
            class="block px-8 py-2 whitespace-nowrap transition duration-100 ease-in-out border-b-2"
            @click.prevent="scrollToTab(tab)"
          >{{ tab.title }}</a>
        </li>
      </ul>
    </nav>

    <div
      ref="tabContainer"
      class="mt-4 px-4 scroll-px-4 lg:px-0 lg:scroll-px-0 snap-x snap-mandatory grid auto-cols-[100%] grid-flow-col gap-x-8 overflow-x-auto scrollbar:hidden"
    >
      <div
        v-for="tab in tabs"
        :key="tab.slot"
        :ref="el => setTabRef(tab.slot, el as HTMLElement|null)"
        :id="`${prefix}-tab-${tab.slot}`"
        :aria-labelledby="`${prefix}-button-${tab.slot}`"
        :class="{
          // shrink pages that are outside of the viewport
          // so that the active page does not grow
          'h-screen overflow-y-auto scrollbar:hidden': tab.slot != activeTab,
          'snap-center snap-always': scrollSnap,
        }"
        role="tabpanel"
      >
        <slot :name="tab.slot"></slot>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, useId, useTemplateRef } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

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
  },
  setup(props) {
    const headerRefs = ref<Record<string, HTMLElement|null>>({})
    const setHeaderRef = (id: string, el: HTMLElement|null) => headerRefs.value[id] = el
    const tabRefs = ref<Record<string, HTMLElement|null>>({})
    const setTabRef = (id: string, el: HTMLElement|null) => tabRefs.value[id] = el
    const tabContainerRef = useTemplateRef<HTMLElement>('tabContainer')
    const navContainerRef = useTemplateRef<HTMLElement>('navContainer')
    const headerContainerRef = useTemplateRef<HTMLElement>('headerContainer')
    const activeTab = ref<string>(props.tabs[0].slot)
    const tabVisibility = ref<Record<string, boolean>>({
      [activeTab.value]: true,
    })

    const scrollUpToTab = () => {
      const offset = tabContainerRef.value!.getBoundingClientRect().top - navContainerRef.value!.getBoundingClientRect().bottom
      if (offset < 0) {
        const top = window.scrollY + offset
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }

    const scrollTabHeaderIntoView = (id: string) => {
      const headerElement = headerRefs.value[id]
      if (headerElement == undefined) {
        return
      }

      const offset = headerElement.getBoundingClientRect().left - headerContainerRef.value!.getBoundingClientRect().left
      const center = tabContainerRef.value!.getBoundingClientRect().width / 2
      if (Math.abs(offset) > center / 2) {
        const left = headerContainerRef.value!.scrollLeft + offset - center
        headerContainerRef.value!.scrollTo({ left, behavior: 'smooth' })
      }
    }

    const scrollActiveTabIntoView = () => {
      scrollTabHeaderIntoView(activeTab.value)
      scrollUpToTab()
    }

    const scrollToTab = (tab: Tab) => {
      const tabElement = tabRefs.value[tab.slot]
      if (tabElement == undefined) {
        return
      }

      const offset = tabElement.getBoundingClientRect().left - tabContainerRef.value!.getBoundingClientRect().left
      const left = tabContainerRef.value!.scrollLeft + offset
      // smooth if it's next to the current tab
      // otherwise auto so no intersection observers get triggered
      const behavior = Math.abs(offset) <= 1.5 * tabElement.getBoundingClientRect().width ? 'smooth' : undefined
      tabContainerRef.value!.scrollTo({ left, behavior })
    }

    const scrollSnap = ref(true)
    let timeout: NodeJS.Timeout

    const setActiveTab = (tab: Tab) => {
      if (activeTab.value == tab.slot) {
        // already done, skip to avoid unnecessary renders
        return
      }

      // FIXME workaround for scroll flicker on mobile devices
      scrollSnap.value = false
      clearTimeout(timeout)
      timeout = setTimeout(() => scrollSnap.value = true, 100)

      activeTab.value = tab.slot
      tabVisibility.value = {
        [activeTab.value]: true,
      }

      scrollActiveTabIntoView()

      // do not write default tab into URL
      const newHash = tab.slot != props.tabs[0].slot ? '#' + tab.slot : ' '

      if (window.location.hash != newHash) {
        window.history.replaceState(null, '', newHash)
      }
    }

    onMounted(() => {
      for (const tab of props.tabs) {
        const tabElement = tabRefs.value[tab.slot]

        useIntersectionObserver(tabElement, ([{ isIntersecting }]) => {
          tabVisibility.value = {
            ...tabVisibility.value,
            [tab.slot]: isIntersecting,
          }
        }, {
          root: tabContainerRef.value,
          threshold: 0.25,
        })

        useIntersectionObserver(tabElement, ([{ isIntersecting }]) => {
          if (isIntersecting) {
            setActiveTab(tab)
          }
        }, {
          root: tabContainerRef.value,
          threshold: 1.0,
        })
      }
    })

    onMounted(() => {
      if (window.location.hash.length > 0) {
        const tabId = window.location.hash.slice(1)
        const tab = props.tabs.find(t => t.slot == tabId)
        if (tab != undefined) {
          scrollToTab(tab)
        }
      }
    })

    const prefix = useId()

    return {
      scrollToTab,
      activeTab,
      tabVisibility,
      scrollSnap,
      setHeaderRef,
      tabRefs,
      setTabRef,
      prefix,
    }
  },
})
</script>
