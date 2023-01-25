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
import { defineComponent, defineAsyncComponent, ComponentPublicInstance, computed } from 'vue'
import '~/assets/css/tailwind.css'
import '~/assets/css/transitions.css'
import '~/assets/css/fonts.css'
import { useRoute } from 'vue-router'

if (import.meta.env.DEV) {
  import('~/assets/css/development.css')
}

const layouts = import.meta.glob<ComponentPublicInstance>('~/layouts/*.vue')

export default defineComponent({
  setup() {
    const route = useRoute()
    const Layout = computed(() => {
      const layout = route.meta.layout as string ?? 'default'
      const promise = layouts[`/layouts/${layout}.vue`]
      return defineAsyncComponent(promise)
    })

    return {
      Layout,
    }
  },
})
</script>
