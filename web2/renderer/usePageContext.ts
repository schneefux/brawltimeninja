import { computed, inject, InjectionKey } from 'vue'
import type { App } from 'vue'
import { PageContext } from './types'

export { usePageContext }
export { setPageContext }

const key = Symbol('pageContext') as InjectionKey<PageContext>

function usePageContext() {
  return inject(key)
}

function setPageContext(app: App, pageContext: PageContext) {
  app.provide(key, pageContext)

  // vue-router backwards compatibility
  const $route = computed(() => ({
    fullPath: pageContext.urlPathname,
  }))
  app.config.globalProperties.$route = $route as any
}
