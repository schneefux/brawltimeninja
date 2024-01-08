export type { PageContextServer }
export type { PageContextClient }
export type { PageContext }
export type { PageProps }
export type { Config }

import { DehydratedState } from '@tanstack/vue-query'
import * as SentryTypes from '@sentry/core'
import type { PageContextBuiltInServer } from 'vike/types'
import type { ComponentPublicInstance } from 'vue'
import { LocaleIso } from '~/locales'

type PageProps = Record<string, unknown>

interface Config {
  mediaUrl: string
  cubeUrl: string
  managerUrl: string
  renderUrl: string
  optimizeId: string
  ga4Id: string
  adsensePubid: string
  sentryDsn: string
  playwireRampPublisherId: string
  playwireRampSiteId: string
  playwireRampGa4Id: string
  quantcastChoiceId: string
  traduora?: {
    url: string
    projectId: string
    token: string
  }
}

type Page = ComponentPublicInstance // https://stackoverflow.com/questions/63985658/how-to-type-vue-instance-out-of-definecomponent-in-vue-3/63986086#63986086

export type PageContextCustom = {
  Page: Page
  pageProps: PageProps
  exports: {
    Layout?: ComponentPublicInstance
  }
  refs: Record<string, unknown>
  vueQueryState: DehydratedState
  piniaState: string
  sentry: typeof SentryTypes,
  envConfig: Config
  validated: null | boolean
  statusCode?: number
  redirectTo?: string
  responseHeaders: Record<string, string>
  server: {
    host: string
    port: number
    requestHeaders: Record<string, string>
  }
  localeMessages: Partial<Record<LocaleIso, Record<string, string>>>
  abortStatusCode?: number
  abortReason?: string
}

type PageContextServer = PageContextBuiltInServer<Page> & PageContextCustom
type PageContextClient = PageContextCustom

type PageContext = PageContextClient | PageContextServer
