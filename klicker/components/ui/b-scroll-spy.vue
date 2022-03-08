<template>
  <div>
    <nav
      ref="toc"
      class="relative"
    >
      <ul>
        <li
          v-for="section in sections"
          :key="section.title"
          :class="{
            'border-primary-400': visibleSections[section.id],
            'border-black/[.1] dark:border-white/[.1] hover:border-primary-200 text-gray-800/75 dark:text-gray-200/75 hover:text-gray-200 dark:hover:text-gray-200': !visibleSections[section.id],
          }"
          class="border-l-2 transition duration-100 ease-in-out px-3 py-2"
        >
          <button
            class="w-full text-left"
            @click="scrollTo(section)"
          >
            {{ section.title }}
          </button>
        </li>
      </ul>
    </nav>

    <!-- "sticky" navigation, mobile-only -->
    <nav
      ref="navContainer"
      :class="navClass"
      class="lg:hidden bg-gray-100 dark:bg-gray-900 z-20 fixed inset-x-0"
    >
      <div
        :aria-pressed="dropdownOpen ? 'true' : 'false'"
        :class="{
          'hidden': dropdownOpen || !shouldStick,
        }"
        data-testid="dropdownToggle"
        class="flex justify-between bg-white/[.05] hover:bg-white/[.07] px-4 py-3"
        role="button"
        @click="dropdownOpen = !dropdownOpen"
      >
        <span>{{ activeSectionTitle }}</span>
        <!-- Tailwind Heroicon name: chevron-down -->
        <svg
          class="ml-2 h-6 w-6 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd"
          ></path>
        </svg>
      </div>

      <ul
        v-show="dropdownOpen"
        data-testid="dropdown"
        class="bg-white/[.05]"
      >
        <li
          v-for="section in sections"
          :key="section.title"
          :class="{
            'bg-white/[.05]': section.id == activeSectionId,
            'text-gray-800/75 dark:text-gray-200/75 hover:text-gray-200 dark:hover:text-gray-200': section.id != activeSectionId,
          }"
          class="transition duration-100 ease-in-out px-4 py-2"
        >
          <button
            class="w-full text-left"
            @click="scrollTo(section)"
          >
            {{ section.title }}
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref, watch, Vue, nextTick } from 'vue-demi'
import { useIntersectionObserver, breakpointsTailwind, useBreakpoints } from '@vueuse/core'

interface Section {
  id: string
  element: undefined|HTMLElement|Vue
  title: string
}

export default defineComponent({
  props: {
    sections: {
      type: Array as PropType<Section[]>,
      required: true
    },
    navClass: {
      type: String,
      default: 'top-0'
    },
  },
  setup(props) {
    const dropdownOpen = ref(false)
    const navContainer = ref<HTMLElement>()
    const visibleSections = ref<Record<string, boolean>>({})
    const activeSectionTitle = ref<string>()
    const activeSectionId = ref<string>()

    const breakpoints = useBreakpoints(breakpointsTailwind)
    const lgAndLarger = breakpoints.greater('lg')

    const scrollTo = (section: Section) => {
      if (section.element == undefined) {
        return
      }
      const sectionElement = '$el' in section.element ? section.element.$el as HTMLElement : section.element

      dropdownOpen.value = false
      // dropdown needs to close first
      nextTick(() => {
        const offset = lgAndLarger.value ? 0 : navContainer.value!.getBoundingClientRect().bottom
        const top = sectionElement.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top, behavior: 'smooth' })
      })
    }

    const stopCallbacks = ref<(() => void)[]>([])
    const updateObservers = () => {
      const topOffset = lgAndLarger.value ? 0 : navContainer.value!.getBoundingClientRect().bottom

      const newStopCallbacks: (() => void)[] = []
      for (const section of props.sections) {
        if (section.element == undefined) {
          continue
        }
        const sectionElement = '$el' in section.element ? section.element.$el as HTMLElement : section.element

        const { stop: stop1 } = useIntersectionObserver(sectionElement, ([{ isIntersecting }]) => {
          if (isIntersecting) {
            activeSectionTitle.value = section.title
            activeSectionId.value = section.id
          }
        }, {
          // trigger when the element touches bottom of the nav container, independent of its size
          threshold: 0.0,
          // observer is 100px tall so an intersection gets triggered even when some frames are dropped during scrolling
          rootMargin: `${-topOffset}px 0px ${-window.innerHeight + topOffset + 100}px 0px`,
        })
        newStopCallbacks.push(stop1)

        const { stop: stop2 } = useIntersectionObserver(sectionElement, ([{ isIntersecting }]) => {
          visibleSections.value = {
            ...visibleSections.value,
            [section.id]: isIntersecting,
          }
        }, {
          threshold: 1.0,
        })
        newStopCallbacks.push(stop2)
      }

      stopCallbacks.value.forEach(stop => stop())
      stopCallbacks.value = newStopCallbacks
    }

    onMounted(updateObservers)
    watch(() => props.sections, updateObservers)

    const toc = ref<HTMLElement>()
    const shouldStick = ref(false)
    onMounted(() => {
      const top = parseInt(window.getComputedStyle(navContainer.value!).top)

      useIntersectionObserver(toc, ([{ isIntersecting }]) => {
        if (isIntersecting) {
          shouldStick.value = false
        } else {
          shouldStick.value = toc.value!.getBoundingClientRect().bottom < top
        }
      }, {
        threshold: 0.0,
      })
    })

    return {
      toc,
      shouldStick,
      stopCallbacks,
      dropdownOpen,
      navContainer,
      scrollTo,
      activeSectionTitle,
      activeSectionId,
      visibleSections,
    }
  },
})
</script>
