import { inferAsyncReturnType } from '@trpc/server'
import { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import { isbot } from 'isbot'

export async function createContext(opts: CreateExpressContextOptions) {
  const isBot = isbot(opts.req.headers['user-agent'] || '')
  const fingerprint = `${opts.req.ip} ${opts.req.headers['user-agent']}`

  return {
    isBot,
    fingerprint,
    res: opts?.res,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
