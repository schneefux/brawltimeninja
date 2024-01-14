import { createApp } from './error-app'
import type { PageContext } from '../../renderer/types'
import { initSentry } from '~/renderer/sentry'

export { onRenderClient }

async function onRenderClient(pageContext: PageContext) {
  const params = createApp(pageContext)
  initSentry(pageContext.envConfig.sentryDsn, params.app)
  params.app.mount('#app')
}
