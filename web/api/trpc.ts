import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { createContext } from './context'
import * as Sentry from '@sentry/node'

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
})
const sentryMiddleware = t.middleware(
  Sentry.Handlers.trpcMiddleware({
    attachRpcInput: true,
  })
)

export const router = t.router
export const publicProcedure = t.procedure.use(sentryMiddleware)
