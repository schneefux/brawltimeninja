import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { createContext } from './context'

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure
