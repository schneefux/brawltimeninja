import * as trpc from '@trpc/server'
import * as trpcNext from '@trpc/server/adapters/next'
import isbot from 'isbot'

export async function createContext(opts?: trpcNext.CreateNextContextOptions) {
  const isBot = isbot(opts?.req.headers['user-agent'] || '')

  return {
    isBot,
    res: opts?.res,
  }
}

type Context = trpc.inferAsyncReturnType<typeof createContext>

export function createRouter() {
  return trpc.router<Context>()
}
