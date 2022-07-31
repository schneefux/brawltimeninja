import * as trpc from '@trpc/client'
import type { AppRouter } from '~/server-middleware/api'
import type { TRPCClient } from '@trpc/client'
import { Plugin } from '@nuxt/types'
import superjson from 'superjson'

const plugin: Plugin = (context, inject) => {
  const baseUrl = process.server ? `http://${process.env.HOST ?? 'localhost'}:${process.env.PORT ?? 3000}` : ''
  const client = trpc.createTRPCClient<AppRouter>({
    url: `${baseUrl}/api`,
    transformer: superjson,
    headers: process.server ? {
      'user-agent': context.req.headers['user-agent']
    } : undefined,
  })

  inject('api', client)
}

export default plugin

declare module 'vue/types/vue' {
  interface Vue {
    $api: TRPCClient<AppRouter>
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $api: TRPCClient<AppRouter>
  }
  interface Context {
    $api: TRPCClient<AppRouter>
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $api: TRPCClient<AppRouter>
  }
}
