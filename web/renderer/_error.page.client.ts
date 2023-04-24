import { createApp } from './error-app'
import type { PageContext } from './types'

export { render }

async function render(pageContext: PageContext) {
  const params = createApp(pageContext)
  params.app.mount('#app')
}
