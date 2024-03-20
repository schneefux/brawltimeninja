import { inferAsyncReturnType } from '@trpc/server'
import { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { isbot } from 'isbot'

export async function createContext(opts: CreateExpressContextOptions) {
  const isBot = isbot(opts.req.headers['user-agent'] || '')

  return {
    isBot,
    res: opts?.res,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
