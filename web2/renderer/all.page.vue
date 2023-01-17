<template>
  <component :is="Layout">
    <router-view v-slot="{ Component }">
      <Suspense>
        <component :is="Component" />
      </Suspense>
    </router-view>
  </component>
</template>

<script lang="ts">
import { defineComponent, defineAsyncComponent } from 'vue'
import '~/assets/css/tailwind.css'
import '~/assets/css/transitions.css'
import '~/assets/css/fonts.css'

if (import.meta.env.DEV) {
  import('~/assets/css/development.css')
}

export default defineComponent({
  props: {
    Layout: {
      type: Object,
      default: () => defineAsyncComponent(() => import('~/layouts/default.vue')),
    },
  },
})
</script>
