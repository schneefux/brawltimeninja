import type { PageContext } from './types'
import Sentry from '@sentry/vue'
import { getTraduoraToken, TraduoraToken } from '~/locales'
import { Dispatcher, Agent } from 'undici'
import { config, Config } from '~/config'

export { onBeforeRender }

// lower the fetch timeouts so that SSR is not blocked by requests
if (import.meta.env.SSR) {
  const setGlobalDispatcher = (d: Dispatcher) => (<any> global)[Symbol.for('undici.globalDispatcher.1')] = d
  if (setGlobalDispatcher) {
    const agent = new Agent({
      bodyTimeout: parseInt(process.env.FETCH_HEADERS_TIMEOUT ?? '') || 3000,
      headersTimeout: parseInt(process.env.FETCH_BODY_TIMEOUT ?? '') || 3000,
    })
    setGlobalDispatcher(agent);
  } else {
    console.warn('undici setGlobalDispatcher is not available, cannot configure timeouts')
  }
}


let cachedTraduoraToken: TraduoraToken | undefined = undefined
async function onBeforeRender(pageContext: PageContext) {
  // during runtime, inject env variables from server
  let traduora: Config['traduora'] | undefined = undefined
  if (process.env.TRADUORA_URL != undefined) {
    const url = process.env.TRADUORA_URL
    const projectId = process.env.TRADUORA_PROJECT_ID ?? ''

    if (cachedTraduoraToken == undefined || cachedTraduoraToken?.expirationDate <= new Date()) {
      const clientId = process.env.TRADUORA_CLIENT_ID ?? ''
      const secret = process.env.TRADUORA_SECRET ?? ''
      cachedTraduoraToken = await getTraduoraToken({ url, clientId, secret })
    }

    traduora = {
      url,
      projectId,
      token: cachedTraduoraToken.token,
    }
  }

  const envConfig = Object.assign({}, config, { traduora })

  const sentry = Sentry

  return {
    pageContext: {
      envConfig, // "config" is internally used by VPS
      sentry,
      refs: {}, // for arbitrary data, see ssrRef()
    }
  }
}
