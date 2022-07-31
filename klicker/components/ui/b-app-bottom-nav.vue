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
      <font-awesome-icon
        :icon="screen.icon"
        class="w-6 h-6"
      ></font-awesome-icon>
      <span class="text-xs leading-none">{{ screen.name }}</span>
    </component>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref, watchEffect, PropType } from '@vue/composition-api'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { IconDefinition } from '@fortawesome/free-solid-svg-icons'

export interface Screen {
  id: string
  icon: IconDefinition
  name: string
  target: string
  prefix: string
}

export default defineComponent({
  components: {
    FontAwesomeIcon,
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
    const active = ref('profile')

    watchEffect(() => {
      const path = props.activeRoute.slice(props.ignoreRoutePrefix.length - 1)

      let longestMatch: Screen|undefined
      let longestMatchLength = 0

      for (const screen of props.screens) {
        const screenUrlLength = screen.prefix.split('/').length
        if (screenUrlLength > longestMatchLength && path.startsWith(screen.prefix)) {
          longestMatch = screen
          longestMatchLength = screenUrlLength
        }
      }

      if (longestMatch != undefined) {
        active.value = longestMatch.id
      }
    })

    return {
      active,
    }
  },
})
</script>
