import type { AppRouter } from '~/api'
import { createTRPCClient, httpLink, TRPCClient } from '@trpc/client'
import superjson from 'superjson'
import { App, InjectionKey } from 'vue'
import { PageContext } from '~/renderer/types'

export const TrpcInjectionKey = Symbol('trpc') as InjectionKey<TRPCClient<AppRouter>>

export default { install }
export { createClient }

function createClient(serverOptions: PageContext['server'] | undefined) {
  const baseUrl = serverOptions != undefined ? `http://${serverOptions.host}:${serverOptions.port}` : ''
  return createTRPCClient<AppRouter>({
    links: [
      httpLink({
        transformer: superjson,
        url: `${baseUrl}/api`,
        headers() {
          if (serverOptions != undefined) {
            // pass headers for bot detection
            const {
              // exclude connection header (forbidden header name)
              connection: _connection,
              ...headers
            } = serverOptions.requestHeaders;
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

function install(app: App, options: { serverOptions: PageContext['server'] | undefined }) {
  app.provide(TrpcInjectionKey, createClient(options.serverOptions))
}
