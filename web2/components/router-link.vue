<template>
  <a
    :href="href"
    :class="{
      [exactActiveClass]: exactActive,
      [activeClass]: active,
    }"
  >
    <slot></slot>
  </a>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import { useRouter, Route, useRoute } from '@/composables/compat'
import { usePageContext } from '@/renderer/usePageContext'

export default defineComponent({
  props: {
    to: {
      type: [String, Object] as PropType<Route>,
      required: true,
    },
    activeClass: {
      type: String,
      default: 'active',
    },
    exactActiveClass: {
      type: String,
      default: 'exact-active',
    },
  },
  setup(props) {
    const pageContext = usePageContext()
    const { routeToPath, localePath } = useRouter()
    const href = computed(() => routeToPath(props.to))
    const hrefPathname = computed(() => href.value.split(/[?#]/)[0])
    const currentPathname = computed(() => localePath(pageContext.urlOriginal))
    const active = computed(() => currentPathname.value.startsWith(hrefPathname.value))
    const exactActive = computed(() => currentPathname.value == hrefPathname.value)

    return {
      href,
      active,
      exactActive,
    }
  },
})
</script>
