import 'dotenv/config'
import httpDevServer from "vavite/http-dev-server"
import express from 'express'
import compression from 'compression'
import { renderPage } from 'vike/server'
import apiMiddleware from '../api/index'
import { PageContext } from '~/renderer/types'
import * as Sentry from '@sentry/node'
import {
  dedupeIntegration,
  extraErrorDataIntegration,
  rewriteFramesIntegration,
} from '@sentry/browser'
import { getHTTPStatusCodeFromError } from '@trpc/server/http'
import { parse, serialize } from 'parse5'
import etag from 'etag'

const isProduction = process.env.NODE_ENV === 'production'
const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000

function optimizeHead(body: string) {
  // reorder head according to capo.js' recommendations
  // https://rviscomi.github.io/capo.js/user/rules/
  // FIXME it would be nicer if unhead-ssr with capo plugin would work together with VPS' injects
  // waiting for https://github.com/vikejs/vike/issues/695
  const root = parse(body)
  const html = root.childNodes.find((node: any) => node.tagName === 'html') as any
  const head = html.childNodes.find((node: any) => node.tagName === 'head')

  const priorities = {
    'meta[charset]': 11,
    'meta[name="viewport"]': 11,
    'title': 10,
    'link[rel="preconnect"]': 9,
    'script[src]': 6,
    'script': 6,
    'link[rel="stylesheet"]': 5,
    'link[rel="preload"]': 4,
  }

  const getPriority = (node: any) => {
    if (!(node.tagName && node.attrs)) {
      return 1
    }

    for (const key in priorities) {
      if (
        (node.attrs.length == 0 && node.tagName === key) ||
        node.attrs.some((attr: any) => `${node.tagName}[${attr.name}="${attr.value}"]` === key) ||
        node.attrs.some((attr: any) => `${node.tagName}[${attr.name}]` === key)
      ) {
        return priorities[key as keyof typeof priorities]
      }
    }

    return 1
  }

  head.childNodes.sort((a: any, b: any) => getPriority(b) - getPriority(a))
  return serialize(root)
}

async function startServer() {
  const app = express()
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    integrations: [
      dedupeIntegration(),
      extraErrorDataIntegration(),
      rewriteFramesIntegration(),
    ],
    ignoreErrors: [
      // ignore errors that are not actionable
      'HeadersTimeoutError',
      'TimeoutError',
      "it didn't finish after 30 seconds", // vike timeout
      'You stumbled upon a bug in Vike',
      'No such label', // console.time
      'mraid.js', // triggered by ads
    ],
    beforeSend(event, hint) {
      const error = hint.originalException as any

      if (error && error.name == 'TRPCError') {
        // ignore non-critical TRPC errors
        if (getHTTPStatusCodeFromError(error) < 500) {
          return null
        }
      }

      if (error && error.name == 'Error' && error.message.length == 0) {
        // cube.js RequestError, ignore
        // FIXME import it from cubejs and match the class
        return null
      }

      return event
    },
  })

  app.use(compression())

  if (isProduction) {
    const sirv = (await import('sirv')).default
    app.use(sirv('./dist/client', {
      maxAge: 31536000, // 1 year
      etag: true,
      immutable: true,
      setHeaders: (res, path) => {
        if (path.endsWith('/sw.js')) {
          res.setHeader('Cache-Control', 'no-cache') // force revalidate with etag
        }
      },
    }))
  }

  app.use('/api', apiMiddleware)

  app.get('/ads.txt', (req, res) => {
    res.redirect(301, `//adstxt.venatusmedia.com/${process.env.VENATUS_SITE_ID}_ads.txt`)
  })

  app.get('*splat', async (req, res, next) => {
    const pageContextInit = {
      urlOriginal: req.originalUrl,
      server: {
        host,
        port,
        requestHeaders: req.headers,
      },
      sentry: Sentry,
    }
    const pageContext = await renderPage<PageContext, typeof pageContextInit>(pageContextInit)
    if (pageContext.errorWhileRendering && (<any> pageContext.errorWhileRendering).message != 'AbortRender') {
      Sentry.captureException(pageContext.errorWhileRendering)
    }
    if (pageContext.redirectTo != undefined) {
      res.redirect(301, pageContext.redirectTo)
      return
    }
    const { httpResponse } = pageContext
    if (!httpResponse) {
      return next()
    }
    let { statusCode, headers, earlyHints, body } = httpResponse
    /*
    // early hints are not supported by nginx - hang the request with http2 (https://forum.nginx.org/read.php?10,293049)
    if (res.writeEarlyHints) {
      res.writeEarlyHints({
        link: earlyHints.map(e => e.earlyHintLink),
      })
    }
    */

    if (headers.some(([h, v]) => h == 'Content-Type' && v == 'text/html;charset=utf-8')) {
      try {
        body = optimizeHead(body)
      } catch (e) {
        console.error(e)
        Sentry.captureException(e)
        // move on with the original body
      }
    }

    const etagHash = etag(body)
    res.set('etag', etagHash)
    res.set('document-policy', 'js-profiling')

    res.set(Object.fromEntries(headers))
    if (pageContext.responseHeaders != undefined) {
      // overwrite default headers with custom headers
      res.set(pageContext.responseHeaders)
    }

    res.status(pageContext.statusCode ?? statusCode)

    if (req.get('if-none-match') === res.get('etag')) {
      res.status(304)
      res.end()
      return
    }

    res.send(body)
  })

  Sentry.setupExpressErrorHandler(app)

  if (import.meta.env.PROD) {
    const port = process.env.PORT || 3000
    app.listen(port)
    console.log(`Server running at http://localhost:${port}`)
  } else {
    httpDevServer!.on('request', app)
  }
}

startServer()
