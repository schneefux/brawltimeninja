<template>
  <component
    :is="Layout"
    :key="locale"
  >
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
import { useI18n } from 'vue-i18n'

const layouts = import.meta.glob<ComponentPublicInstance>('../layouts/*.vue', { eager: true, import: 'default' })

export default defineComponent({
  setup() {
    if (import.meta.env.DEV) {
      import('~/assets/css/development.css')
    }

    const route = useRoute()
    const Layout = computed(() => {
      const layout = route.meta.layout as string ?? 'default'
      const path = `../layouts/${layout}.vue`
      if (!(path in layouts)) {
        throw new Error('Layout cannot be loaded: ' + path)
      }
      return layouts[path]
    })

    const i18n = useI18n()
    // put locale as key on the root component to force rerender on locale change
    const locale = computed(() => i18n.locale.value)

    return {
      Layout,
      locale,
    }
  },
})
</script>