<template>
  <b-app-bottom-nav
    tag="router-link"
    :screens="screens"
    :active-route="route.path"
    :ignore-route-prefix="localePath('/')"
  ></b-app-bottom-nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { BAppBottomNav } from '@schneefux/klicker/components'
import { useRoute } from 'vue-router'
import { useScreens } from '~/composables/screens'

export default defineComponent({
  components: {
    BAppBottomNav,
  },
  setup() {
    const screens = useScreens()
    const route = useRoute()

    return {
      screens,
      route,
    }
  },
})
</script>
