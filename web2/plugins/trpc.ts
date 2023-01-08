import * as trpc from '@trpc/client'
import type { AppRouter } from '~/api'
import type { TRPCClient } from '@trpc/client'
import superjson from 'superjson'
import { App, InjectionKey } from 'vue'

export const TrpcInjectionKey = Symbol('trpc') as InjectionKey<TRPCClient<AppRouter>>

export default { install }

function install(app: App) {
  const baseUrl = import.meta.env.SSR ? `http://${import.meta.env.HOST ?? 'localhost'}:${import.meta.env.PORT ?? 3000}` : ''
  const client = trpc.createTRPCClient<AppRouter>({
    url: `${baseUrl}/api`,
    transformer: superjson,
    // TODO
    /*
    headers: import.meta.env.SSR ? {
      'user-agent': context.req.headers['user-agent']
    } : undefined,
    */
  })

  app.provide(TrpcInjectionKey, client)
}
