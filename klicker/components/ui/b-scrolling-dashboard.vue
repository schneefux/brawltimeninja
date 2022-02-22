<template>
  <div class="relative">
    <div
      ref="container"
      class="dashboard dashboard--horizontal dashboard--responsive dashboard--relaxed -mr-4 pr-4 lg:mr-0 lg:pr-0 hide-scrollbar"
    >
      <slot></slot>
    </div>

    <div
      v-show="!arrivedRight"
      class="absolute inset-y-0 -right-4 pointer-events-none w-4 bg-gradient-to-r from-transparent to-gray-700 z-10 lg:hidden"
    ></div>

    <div
      class="absolute left-0 inset-y-0 w-10 -ml-5 flex-col justify-center hidden"
      :class="{
        'lg:flex': !arrivedLeft,
      }"
    >
      <b-button
        class="h-10"
        primary
        round
        @click="scrollLeft()"
      >
        <font-awesome-icon
          :icon="faChevronLeft"
        ></font-awesome-icon>
      </b-button>
    </div>

    <div
      class="absolute right-0 inset-y-0 w-10 -mr-5 flex-col justify-center hidden"
      :class="{
        'lg:flex': !arrivedRight,
      }"
    >
      <b-button
        class="h-10"
        primary
        round
        @click="scrollRight()"
      >
        <font-awesome-icon
          :icon="faChevronRight"
        ></font-awesome-icon>
      </b-button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue-demi'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import BButton from './b-button.vue'
import { useScroll } from '@vueuse/core'

export default defineComponent({
  components: {
    BButton,
  },
  setup(props) {
    const container = ref<HTMLElement|null>()

    const scrollTo = (direction: number) => {
      const rect = container.value!.getBoundingClientRect()
      const left = container.value!.scrollLeft + rect.width * direction
      container.value!.scrollTo({ left, behavior: 'smooth' })
    }
    const scrollLeft = () => scrollTo(-1)
    const scrollRight = () => scrollTo(+1)

    const arrivedLeft = ref<boolean>(true)
    const arrivedRight = ref<boolean>(true)
    const updateArrivedStates = () => {
      const scrollable = container.value!.scrollWidth > container.value!.clientWidth
      arrivedLeft.value = scroll.arrivedState.left || !scrollable
      arrivedRight.value = scroll.arrivedState.right || !scrollable
    }
    const scroll = useScroll(container, {
      onStop: updateArrivedStates,
    })
    onMounted(() => updateArrivedStates())

    return {
      container,
      scrollLeft,
      scrollRight,
      arrivedLeft,
      arrivedRight,
      faChevronLeft,
      faChevronRight,
    }
  },
})
</script>

<style scoped lang="postcss">
.scroll-shadow {
  background-image: linear-gradient(to right, theme('colors.gray.900') 0%, theme('colors.gray.700') 100%);
}
</style>
