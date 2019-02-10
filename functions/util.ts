import fetch from 'node-fetch';
import { URLSearchParams, URL } from 'url';
import { Agent } from 'https';

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

  return fetch(url.toString(), {
    headers,
    agent,
    compress: true,
  }).then((response) => response.json());
}