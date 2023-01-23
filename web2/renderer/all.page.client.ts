import { createApp } from './app'
import type { PageContext } from './types'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client/router'
import { hydrate } from '@tanstack/vue-query'
import SuperJSON from 'superjson'

export const prefetchStaticAssets = { when: 'HOVER' }
export { render }

async function render(pageContext: PageContextBuiltInClient & PageContext) {
  const params = await createApp(pageContext)
  hydrate(params.queryClient, pageContext.vueQueryState)
  params.pinia.state.value = SuperJSON.parse(pageContext.piniaState)
  await params.router.isReady()
  params.app.mount('#app', true)
}
