import { createApp } from './app'
import type { PageContext } from './types'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client/router'
import { hydrate } from '@tanstack/vue-query'

export const clientRouting = true
export const prefetchStaticAssets = { when: 'HOVER' }
export { render }

let app: Awaited<ReturnType<typeof createApp>>['app']
async function render(pageContext: PageContextBuiltInClient & PageContext) {
  if (!app) {
    const params = await createApp(pageContext)
    app = params.app
    const queryClient = params.queryClient
    hydrate(queryClient, pageContext.vueQueryState)
    app.mount('#app')
  } else {
    app.changePage(pageContext)
  }
}
