import { inject, reactive, Reactive } from 'vue'
import type { App, InjectionKey } from 'vue'
import { PageContext } from '../renderer/types'

export { usePageContext }
export { setPageContext }

const key: InjectionKey<Reactive<PageContext>> = Symbol('pageContext')

function usePageContext() {
  const pageContext = inject(key)
  if (!pageContext) throw new Error('setPageContext() not called in parent')
  return pageContext
}

function setPageContext(app: App, pageContext: PageContext) {
  app.provide(key, reactive(pageContext))
}
