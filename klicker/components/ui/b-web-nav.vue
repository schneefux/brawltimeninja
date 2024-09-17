<template>
  <nav class="light bg-primary-400 text-text py-6 z-40 sticky top-0 lg:static">
    <!-- px/mx to align menu items with split-dashboard -->
    <div class="px-6 2xl:px-12 w-full 2xl:mx-[20rem] flex flex-wrap justify-between items-center gap-x-10 gap-y-4">
      <div class="flex flex-wrap items-center gap-x-10">
        <slot name="logo"></slot>

        <ul class="inline-block space-x-6 whitespace-nowrap">
          <li
            v-for="screen in screens"
            :key="screen.target"
            class="inline"
          >
            <component
              :is="tag"
              :to="screen.target"
              class="text-lg hover:text-contrast/50"
              :class="{
                'text-primary-700': screen.id == active,
              }"
            >
              <fa
                v-if="screen.icon"
                :icon="screen.icon"
                class="w-4 h-4 mr-1"
              ></fa>
              {{ screen.name }}
            </component>
          </li>
        </ul>

        <slot name="after"></slot>
      </div>

      <div class="flex items-center gap-x-6">
        <slot name="end"></slot>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import Fa from '../fa.vue'
import { Screen, useActiveScreen } from '../../composables/screen-active';

export default defineComponent({
  components: {
    Fa,
  },
  props: {
    tag: {
      type: String,
      default: 'router-link'
    },
    screens: {
      type: Array as PropType<Screen[]>,
      required: true
    },
    activeRoute: {
      type: String,
      required: true
    },
    ignoreRoutePrefix: {
      type: String,
      default: '/'
    },
  },
  setup(props) {
    const active = useActiveScreen(
      computed(() => props.activeRoute),
      computed(() => props.ignoreRoutePrefix),
      computed(() => props.screens)
    )

    return {
      active,
    }
  },
})
</script>
