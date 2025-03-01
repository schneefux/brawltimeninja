import { URLSearchParams, URL } from 'url'
import StatsD from 'hot-shots'
import { TRPCError } from '@trpc/server'
import { fetch } from 'undici'

const stats = new StatsD({ prefix: 'brawltime.api.' })

export class RequestError extends Error {
  constructor(public response: {
    url: string,
    status: number,
    reason: string,
  }) {
    super(response.reason)
  }
}

export function request<T>(
    path: string,
    base: string,
    metricName: string,
    params: { [key: string]: string },
    headers: { [header: string]: string },
    timeoutMs: number = 10000): Promise<T> {
  const url = new URL(base + path)
  const urlParams = new URLSearchParams(params)
  url.search = urlParams.toString()
  const urlStr = url.toString()

  stats.increment(metricName + '.run')
  const fun = () => fetch(urlStr, {
      headers: {
        'User-Agent': 'BrawlTimeNinja/1.0 (+https://brawltime.ninja; dev@brawltime.ninja)',
        'Accept-Encoding': 'gzip, deflate, br',
        ...headers,
      },
      signal: AbortSignal.timeout(timeoutMs),
    })
    .then(async response => {
      if (!response.ok) {
        if (response.status == 429) {
          stats.increment(metricName + '.ratelimited')
        } else if (response.status >= 500) {
          stats.increment(metricName + '.servererror')
        }

        if (response.body) {
          // consume body to close connection, https://undici.nodejs.org/#/?id=garbage-collection
          for await (const chunk of response.body) {}
        }

        throw new RequestError({
          url: url.toString(),
          status: response.status,
          reason: response.statusText,
        })
      }

      return response.json() as Promise<T>
    })
    .catch(error => {
      if (error instanceof RequestError) {
        if (error.response.status >= 500) {
          console.error(error, error.response)

          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR', // TODO trpc does not support 503
            message: error.response.reason,
            cause: error,
          })
        }

        if (error.response.status == 404) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: error.response.reason,
            cause: error,
          })
        }

        if (error.response.status == 429) {
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: error.response.reason,
            cause: error,
          })
        }

        console.error(error, error.response)

        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error.response.reason,
          cause: error,
        })
      }

      if (error instanceof DOMException && error.name == 'TimeoutError') {
        stats.increment(metricName + '.timeout')

        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'API took too long to respond',
          cause: error,
        })
      }

      stats.increment(metricName + '.error')
      throw error
    })

  return stats.asyncTimer<[], T>(fun, metricName + '.timer')()
}
