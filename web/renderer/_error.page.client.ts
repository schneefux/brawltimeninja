import { createApp } from './error-app'
import type { PageContext } from './types'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client/router'

export { render }

async function render(pageContext: PageContextBuiltInClient & PageContext) {
  const params = createApp(pageContext)
  params.app.mount('#app')
}
