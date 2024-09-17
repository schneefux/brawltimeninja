<template>
  <nav class="light sticky bottom-0 z-40 h-14 bg-primary-400 flex justify-around">
    <component
      :is="tag"
      v-for="screen in screens"
      :key="screen.target"
      :to="screen.target"
      :class="{
        'text-text/75': screen.id == active,
        'text-primary-700': screen.id != active,
      }"
      class="flex-1 flex flex-col items-center justify-between pt-2 pb-3 px-3"
    >
      <fa
        :icon="screen.icon"
        class="w-6 h-6"
      ></fa>
      <span class="text-xs leading-none">{{ screen.name }}</span>
    </component>
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
