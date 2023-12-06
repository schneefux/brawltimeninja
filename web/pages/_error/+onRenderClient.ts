import { createApp } from './error-app'
import type { PageContext } from '../../renderer/types'

export { onRenderClient }

async function onRenderClient(pageContext: PageContext) {
  const params = createApp(pageContext)
  params.app.mount('#app')
}
