import { inferAsyncReturnType } from '@trpc/server'
import { CreateNextContextOptions } from '@trpc/server/adapters/next'
import isbot from 'isbot'

export async function createContext(opts: CreateNextContextOptions) {
  const isBot = isbot(opts.req.headers['user-agent'] || '')

  return {
    isBot,
    res: opts?.res,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
