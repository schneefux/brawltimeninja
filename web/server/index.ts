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

    // find line with "ramp.js" and move to very top of <head> (required by playwire)
    // FIXME it would be nicer if unhead-ssr would work together with VPS' injects
    const lines = body.split(/\r?\n/)
    let beginIndex = lines.findIndex(line => line.includes('<head>'))
    lines.forEach((line, index) => {
      if (line.includes('<script') && line.includes('</script>') && (
          line.includes('ramp') ||
          line.includes('choice.js') || line.includes('checkIfUspIsReady')) // also move quantcast to top
        ) {
        lines.splice(index, 1)
        lines.splice(beginIndex + 1, 0, line)
        beginIndex++
      }
    })
    const newBody = lines.join('\n')

    res.status(pageContext.statusCode ?? statusCode).type(contentType).send(newBody)
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
