<template>
  <div v-if="is404">
    <h1>404 Page Not Found</h1>
    <p>This page could not be found.</p>
  </div>
  <div v-else-if="error">
    <pre>{{ error }}</pre>
  </div>
  <div v-else>
    <h1>500 Internal Server Error</h1>
    <p>Something went wrong.</p>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { usePageContext } from './usePageContext'

export { default as Layout } from '~/layouts/empty.vue'

export default defineComponent({
  props: ['is404'],
  setup() {
    const pageContext = usePageContext()
    const error = computed(() => pageContext.errorWhileRendering)

    return {
      error,
    }
  }
})
</script>
