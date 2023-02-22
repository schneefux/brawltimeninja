<template>
  <section
    ref="section"
    v-bind-once="title != undefined ? { 'aria-labelledby': id } : {}"
  >
    <div
      v-if="title != undefined"
      class="mt-16"
    >
      <h1
        class="text-2xl"
        v-bind-once="{ id }"
      >
        {{ title }}
      </h1>
      <slot name="description"></slot>
    </div>

    <lazy-hydration-wrapper v-if="!hydrate">
      <div
        :class="{
          'mt-4': title != undefined,
          'mt-8': title == undefined,
        }"
      >
        <slot></slot>
      </div>
    </lazy-hydration-wrapper>

    <div
      v-else
      :class="{
        'mt-4': title != undefined,
        'mt-8': title == undefined,
      }"
    >
    <slot></slot>
    </div>
  </section>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import { LazyHydrationWrapper } from 'vue3-lazy-hydration'
import { useIntersectionObserver } from '@vueuse/core'
import { generateId, BindOnce } from '../../directives/bind-once'

export default defineComponent({
  components: {
    LazyHydrationWrapper,
  },
  directives: {
    BindOnce,
  },
  props: {
    title: {
      type: String,
      required: false
    },
    lazy: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {
    const section = ref<HTMLElement>()
    const id = generateId()

    // never hydrate, instead rerender when visible to prevent hydration errors
    const hydrate = ref(!props.lazy)

    if (!import.meta.env.SSR) {
      const { isSupported, stop } = useIntersectionObserver(section, ([ { isIntersecting } ]) => {
        if (isIntersecting) {
          hydrate.value = true
          stop()
        }
      }, {
        rootMargin: `50% 50% 50% 50%`,
      })

      if (!isSupported) {
        hydrate.value = true
      }
    }

    return {
      id,
      section,
      hydrate,
    }
  },
})
</script>
