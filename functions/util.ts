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

export function request(path: string,
    base: string,
    params: { [key: string]: string },
    headers: { [header: string]: string }) {

  const url = new URL(path, base);
  const urlParams = new URLSearchParams(params);
  url.search = urlParams.toString();
  const urlStr = url.toString();

  return cache.wrap(urlStr, () => fetch(urlStr, {
      headers,
      agent,
      compress: true,
    }).then((response) => response.json())
  );
}