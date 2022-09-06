import { fetch, Agent, Request } from 'undici'
import { URLSearchParams, URL } from 'url'
import StatsD from 'hot-shots'

const stats = new StatsD({ prefix: 'brawltime.api.' })

const agent = new Agent({
  keepAliveTimeout: 90*60,
})

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
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  stats.increment(metricName + '.run')
  const fun = () => fetch(urlStr, {
      headers: {
        'Accept-Encoding': 'gzip, deflate, br',
        ...headers,
      },
      dispatcher: agent,
      signal: controller.signal,
    })
    .then(response => {
      console.log(response)
      if (!response.ok) {
        if (response.status == 429) {
          stats.increment(metricName + '.ratelimited')
        } else if (response.status >= 500) {
          stats.increment(metricName + '.servererror')
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
      if (error.type == 'aborted') {
        stats.increment(metricName + '.timeout')

        throw new RequestError({
          url: url.toString(),
          status: 429,
          reason: 'API took too long to respond',
        })
      }
      stats.increment(metricName + '.error')
      throw error
    })
    .finally(() => clearTimeout(timeout))

  return stats.asyncTimer<[], T>(fun, metricName + '.timer')()
}
