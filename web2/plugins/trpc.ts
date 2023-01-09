import type { AppRouter } from '~/api'
import { CreateTRPCProxyClient, createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { App, InjectionKey } from 'vue'

export const TrpcInjectionKey = Symbol('trpc') as InjectionKey<CreateTRPCProxyClient<AppRouter>>

export default { install }

function install(app: App) {
  const baseUrl = import.meta.env.SSR ? `http://${import.meta.env.HOST ?? 'localhost'}:${import.meta.env.PORT ?? 3000}` : ''
  const client = createTRPCProxyClient<AppRouter>({
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

  app.provide(TrpcInjectionKey, client)
}
