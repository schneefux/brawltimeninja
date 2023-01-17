import { createApp } from './app'
import type { PageContext } from './types'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client/router'
import { hydrate } from '@tanstack/vue-query'

export const prefetchStaticAssets = { when: 'HOVER' }
export { render }

async function render(pageContext: PageContextBuiltInClient & PageContext) {
  const params = await createApp(pageContext)
  const queryClient = params.queryClient
  hydrate(queryClient, pageContext.vueQueryState)
  await params.router.isReady()
  params.app.mount('#app', true)
}
