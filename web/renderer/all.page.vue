<template>
  <component :is="Layout">
    <router-view v-slot="{ Component }">
      <Suspense>
        <component :is="Component"></component>
      </Suspense>
    </router-view>
  </component>
</template>

<script lang="ts">
import { defineComponent, ComponentPublicInstance, computed } from 'vue'
import '~/assets/css/tailwind.css'
import '~/assets/css/transitions.css'
import '~/assets/css/fonts.css'
import { useRoute } from 'vue-router'

if (import.meta.env.DEV) {
  import('~/assets/css/development.css')
}

const layouts = import.meta.glob<ComponentPublicInstance>('~/layouts/*.vue', { eager: true, import: 'default' })

export default defineComponent({
  setup() {
    const route = useRoute()
    const Layout = computed(() => {
      const layout = route.meta.layout as string ?? 'default'
      return layouts[`/layouts/${layout}.vue`]
    })

    return {
      Layout,
    }
  },
})
</script>
