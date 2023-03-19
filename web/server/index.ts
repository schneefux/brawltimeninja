import 'dotenv/config'
import httpDevServer from "vavite/http-dev-server"
import express from 'express'
import compression from 'compression'
import { renderPage } from 'vite-plugin-ssr'
import apiMiddleware from '../api/index'
import { PageContext } from '@/renderer/types'
import * as Sentry from '@sentry/node'
import {
  Dedupe as DedupeIntegration,
  CaptureConsole as CaptureConsoleIntegration,
  ExtraErrorData as ExtraErrorDataIntegration,
  RewriteFrames as RewriteFramesIntegration,
} from '@sentry/integrations'

const isProduction = process.env.NODE_ENV === 'production'
const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000

async function startServer() {
  const app = express()
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.SENTRY_RELEASE,
    integrations: [
      new DedupeIntegration(),
      new ExtraErrorDataIntegration(),
      new RewriteFramesIntegration(),
      new CaptureConsoleIntegration({
        levels: ['error', 'assert'],
      }),
    ],
    tracesSampleRate: 1.0,
  })
  app.use(Sentry.Handlers.requestHandler())

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
    res.redirect(301, '//config.playwire.com/dyn_ads/1024864/74021/ads.txt')
  })

  app.get('*', async (req, res, next) => {
    const pageContextInit = {
      urlOriginal: req.originalUrl,
      server: {
        host,
        port,
        requestHeaders: req.headers,
      },
    }
    const pageContext = await renderPage<PageContext, typeof pageContextInit>(pageContextInit)
    if (pageContext.responseHeaders != undefined) {
      res.set(pageContext.responseHeaders)
    }
    if (pageContext.redirectTo != undefined) {
      res.redirect(301, pageContext.redirectTo)
      return
    }
    const { httpResponse } = pageContext
    if (!httpResponse) {
      return next()
    }
    const { statusCode, contentType, earlyHints, body } = httpResponse
    if (res.writeEarlyHints) {
      res.writeEarlyHints({
        link: earlyHints.map(e => e.earlyHintLink),
      })
    }

    res.status(pageContext.statusCode ?? statusCode).type(contentType).send(body)
  })

  app.use(Sentry.Handlers.errorHandler())

  if (import.meta.env.PROD) {
    const port = process.env.PORT || 3000
    app.listen(port)
    console.log(`Server running at http://localhost:${port}`)
  } else {
    httpDevServer!.on('request', app)
  }
}

startServer()
