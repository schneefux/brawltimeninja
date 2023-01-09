export type { PageContextServer }
export type { PageContextClient }
export type { PageContext }
export type { PageProps }

import { DehydratedState } from '@tanstack/vue-query'
import type { PageContextBuiltIn } from 'vite-plugin-ssr'
import type { PageContextBuiltInClient } from 'vite-plugin-ssr/client/router'
import type { ComponentPublicInstance } from 'vue'

type Page = ComponentPublicInstance // https://stackoverflow.com/questions/63985658/how-to-type-vue-instance-out-of-definecomponent-in-vue-3/63986086#63986086
type PageProps = {
  vueQueryState: DehydratedState
}

// The `pageContext` that are available in both on the server-side and browser-side
export type PageContextCustom = {
  Page: Page
  pageProps?: PageProps
  exports: {
    documentProps?: {
      title: string
    }
    Layout?: ComponentPublicInstance
  }
  urlPathname: string
  urlParsed: {
    origin: null | string
    pathname: string
    pathnameOriginal: string
    search: Record<string, string>
    searchAll: Record<string, string[]>
    searchOriginal: null | string
    hash: string
    hashOriginal: null | string
  }
}

type PageContextServer = PageContextBuiltIn<Page> & PageContextCustom
type PageContextClient = PageContextBuiltInClient<Page> & PageContextCustom

type PageContext = PageContextClient | PageContextServer
