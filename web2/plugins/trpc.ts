import type { AppRouter } from '~/api'
import { CreateTRPCProxyClient, createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import { App, InjectionKey } from 'vue'
import { PageContext } from '@/renderer/types'

export const TrpcInjectionKey = Symbol('trpc') as InjectionKey<CreateTRPCProxyClient<AppRouter>>

export default { install }
export { createClient }

function createClient(pageContext: PageContext) {
  const baseUrl = import.meta.env.SSR ? `http://${pageContext.server.host}:${pageContext.server.port}` : ''
  return createTRPCProxyClient<AppRouter>({
    transformer: superjson,
    links: [
      httpBatchLink({
        url: `${baseUrl}/api`,
        headers() {
          if (import.meta.env.SSR) {
            // pass headers for bot detection
            const {
              // exclude connection header (forbidden header name)
              connection: _connection,
              ...headers
            } = pageContext.server.request.headers;
            return {
              ...headers,
              'x-ssr': '1',
            };
          }

          return {}
        },
      }),
    ],
  })
}

function install(app: App, options: { pageContext: PageContext }) {
  app.provide(TrpcInjectionKey, createClient(options.pageContext))
}
