import fetch from 'node-fetch';
import { URLSearchParams, URL } from 'url';
import { Agent } from 'https';
import cacheManager from 'cache-manager';
import fsStore from 'cache-manager-fs-hash';

const cacheSeconds = 60*5;
const cachePath = process.env.CACHE_PATH || 'cache';
const cacheDisable = !!process.env.CACHE_DISABLE;

const cache = cacheDisable ?
  cacheManager.caching({
    store: 'memory',
    max: 0,
    ttl: cacheSeconds
  }) :
  cacheManager.caching(<any>{
    store: fsStore,
    options: { path: cachePath, subdirs: true, },
  });

const agent = new Agent({
  keepAlive: true,
  keepAliveMsecs: 90*60,
});

export function request<T>(path: string,
    base: string,
    params: { [key: string]: string },
    headers: { [header: string]: string }): Promise<T|null> {
  const url = new URL(base + path);
  const urlParams = new URLSearchParams(params);
  url.search = urlParams.toString();
  const urlStr = url.toString();

  return cache.wrap(urlStr, () => fetch(urlStr, {
      headers,
      agent,
      compress: true,
    }).then((response) => {
      if (response.status >= 500 || response.status == 429) {
        throw Error(response.statusText);
      }
      if (response.status == 404) {
        return null;
      }
      return response.json();
    })
  );
}

export const flatten2d = <T>(arr: T[][]) =>
  arr.reduce((agg, cur) => agg.concat(cur), []);

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const fixedPercent = (n1: number, n2: number) =>
  (n1 / n2 * 100).toFixed(0) + '%';
