<template>
  <section
    ref="section"
    :aria-labelledby="title != undefined ? id : undefined"
  >
    <div
      v-if="title != undefined"
      class="mt-16"
    >
      <h1
        :id="id"
        class="text-2xl"
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
import { ref, defineComponent, useId, useTemplateRef } from 'vue'
import { LazyHydrationWrapper } from 'vue3-lazy-hydration'
import { useIntersectionObserver } from '@vueuse/core'

export default defineComponent({
  components: {
    LazyHydrationWrapper,
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
    const sectionRef = useTemplateRef<HTMLElement>('section')
    const id = useId()

    // never hydrate, instead rerender when visible to prevent hydration errors
    const hydrate = ref(!props.lazy)

    if (!import.meta.env.SSR) {
      const { isSupported, stop } = useIntersectionObserver(sectionRef, ([ { isIntersecting } ]) => {
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
      hydrate,
    }
  },
})
</script>
