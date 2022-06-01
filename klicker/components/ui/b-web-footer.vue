<template>
  <footer class="light bg-primary-400 text-text py-4 text-center leading-normal hidden lg:block">
    <div class="space-x-4 mt-2">
      <component
        :is="tag"
        v-for="link in links"
        :key="link.target"
        :to="link.target"
        class="inline-block lg:border-0 hover:text-text/75"
        exact-active-class="text-secondary-800"
      >
        {{ link.name }}
      </component>
    </div>
    <slot name="below"></slot>
  </footer>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'

export interface Link {
  target: string
  name: string
}

export default defineComponent({
  props: {
    links: {
      type: Array as PropType<Link[]>,
      required: true
    },
    tag: {
      type: String,
      default: 'router-link'
    },
  },
})
</script>
