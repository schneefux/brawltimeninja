import { createSSRApp } from 'vue'
import type { PageContext } from '../../renderer/types'
import { setPageContext } from '../../renderer/usePageContext'
import { createHead } from '@unhead/vue'
import { ClientOnly } from '@schneefux/klicker/components'

export { createApp }

function createApp(pageContext: PageContext) {
  const { Page } = pageContext

  const app = createSSRApp(Page)

  setPageContext(app, pageContext)

  const themeColor = '#facc15' // yellow-400
  const head = createHead()
  head.push({
    title: 'Error - Brawl Time Ninja',
    bodyAttrs: {
      class: ['dark'],
    },
    link: [
      { rel: 'icon', href: '/icons/favicon.ico', sizes: 'any' },
      { rel: 'icon', href: '/icons/favicon.svg', type: 'image/svg+xml' },
    ],
    meta: [
      { name: 'theme-color', content: themeColor },
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width' },
    ],
  })
  app.use(head)

  app.component('ClientOnly', ClientOnly)

  return {
    app,
    head,
  }
}
