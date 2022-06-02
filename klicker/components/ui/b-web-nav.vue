<template>
  <nav class="light bg-primary-400 text-text p-6 flex justify-between items-center flex-wrap gap-y-3 z-40 sticky top-0 lg:static">
    <slot name="logo"></slot>

    <div class="overflow-x-auto overflow-y-hidden whitespace-nowrap space-x-4">
      <slot name="before"></slot>

      <ul class="inline-block space-x-4">
        <li
          v-for="link in links"
          :key="link.target"
          class="inline"
        >
          <component
            :is="tag"
            :to="link.target"
            class="text-lg hover:text-contrast/50"
            exact-active-class="text-secondary-800"
          >
            {{ link.name }}
          </component>
        </li>
      </ul>

      <slot name="after"></slot>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue-demi'

export interface Link {
  name: string
  target: string
}

export default defineComponent({
  props: {
    tag: {
      type: String,
      default: 'router-link'
    },
    links: {
      type: Array as PropType<Link[]>,
      required: true
    },
  },
})
</script>
