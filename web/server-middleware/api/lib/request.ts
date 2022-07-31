import fetch from 'node-fetch-2'
import AbortController from 'abort-controller'
import { URLSearchParams, URL } from 'url'
import { Agent as HttpAgent } from 'http'
import { Agent as HttpsAgent } from 'https'
import StatsD from 'hot-shots'

const stats = new StatsD({ prefix: 'brawltime.api.' })

const httpAgent = new HttpAgent({
  keepAlive: true,
  keepAliveMsecs: 90*60,
})

const httpsAgent = new HttpsAgent({
  keepAlive: true,
  keepAliveMsecs: 90*60,
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
  const agent = urlStr.startsWith('https') ? httpsAgent : httpAgent
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  stats.increment(metricName + '.run')
  const fun = () => fetch(urlStr, {
      headers,
      agent,
      compress: true,
      signal: controller.signal,
    })
    .then(response => {
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
