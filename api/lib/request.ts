import fetch from 'node-fetch';
import { URLSearchParams, URL } from 'url';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
import cacheManager from 'cache-manager';
import fsStore from 'cache-manager-fs-hash';
import StatsD from 'hot-shots'

const cachePath = process.env.CACHE_PATH || 'cache';
const cacheDisable = !!process.env.CACHE_DISABLE;

export const cache = cacheDisable ?
  cacheManager.caching({
    store: 'memory',
    max: 0,
    ttl: 180,
  }) :
  cacheManager.caching(<any>{
    max: 10000,
    store: fsStore,
    ttl: 180,
    options: { path: cachePath, subdirs: true, },
  });

const stats = new StatsD({ prefix: 'brawltime.api.' })

const httpAgent = new HttpAgent({
  keepAlive: true,
  keepAliveMsecs: 90*60,
});

const httpsAgent = new HttpsAgent({
  keepAlive: true,
  keepAliveMsecs: 90*60,
});

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function request<T>(
    path: string,
    base: string,
    metricName: string,
    params: { [key: string]: string },
    headers: { [header: string]: string },
    timeoutMs: number = 10000,
    ttlS: number = 180): Promise<T> {
  const url = new URL(base + path);
  const urlParams = new URLSearchParams(params);
  url.search = urlParams.toString();
  const urlStr = url.toString();
  const agent = urlStr.startsWith('https') ? httpsAgent : httpAgent;

  stats.increment(metricName + '_cache_access')
  return Promise.race([
    sleep(timeoutMs).then(() => {
      stats.increment(metricName + '_timeout');
      throw {
        url: url.toString(),
        status: 429,
        reason: 'API took too long to respond',
      };
    }),
    cache.wrap(urlStr, () => stats.asyncTimer(() => fetch(urlStr, {
        headers,
        agent,
        compress: true,
      }), metricName + '_timer')().then(response => {
        stats.increment(metricName + '_cache_miss');
        if (!response.ok) {
          stats.increment(metricName + '_error');
          throw {
            url: url.toString(),
            status: response.status,
            reason: response.statusText,
          };
        }

        return response.json();
      })
    , { ttl: ttlS }),
  ]);
}

export function post<T>(
    url: string,
    data: any,
    timeout: number = 500): Promise<T> {
  const agent = url.startsWith('https') ? httpsAgent : httpAgent;

  return Promise.race([
    sleep(timeout).then(() => {
      throw {
        url: url.toString(),
        status: 429,
        reason: 'API took too long to respond',
      };
    }),
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      agent,
      compress: true,
    }).then(response => {
      if (!response.ok) {
        throw {
          url: url.toString(),
          status: response.status,
          reason: response.statusText,
        };
      }

      return response.json();
    })
  ]);
}
