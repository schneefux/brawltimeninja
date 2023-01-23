import type { AppRouter } from '~/api'
import { CreateTRPCProxyClient, createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { App, InjectionKey } from 'vue'

export const TrpcInjectionKey = Symbol('trpc') as InjectionKey<CreateTRPCProxyClient<AppRouter>>

export default { install }
export { createClient }

function createClient() {
  const baseUrl = import.meta.env.SSR ? `http://${import.meta.env.HOST ?? 'localhost'}:${import.meta.env.PORT ?? 3000}` : ''
  return createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${baseUrl}/api`,
        // TODO
        /*
        headers() {
          return import.meta.env.SSR ? {
            'user-agent': context.req.headers['user-agent']
          } : undefined,
        },
        */
      }),
    ],
  })
}

function install(app: App) {
  app.provide(TrpcInjectionKey, createClient())
}
