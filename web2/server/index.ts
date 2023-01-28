import * as dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import compression from 'compression'
import { renderPage } from 'vite-plugin-ssr'
import apiMiddleware from '../api/index.js'
import { root } from './root.js'
import { PageContext } from '@/renderer/types.js'

const isProduction = process.env.NODE_ENV === 'production'

const app = express()

app.use(compression())

if (isProduction) {
  const sirv = (await import('sirv')).default
  app.use(sirv(`${root}/dist/client`))
} else {
  const vite = await import('vite')
  const viteDevMiddleware = (
    await vite.createServer({
      root,
      envDir: root,
      server: { middlewareMode: true },
      appType: 'custom',
    })
  ).middlewares
  app.use(viteDevMiddleware)
}

app.use('/api', apiMiddleware)

app.get('*', async (req, res, next) => {
  const pageContextInit = {
    urlOriginal: req.originalUrl
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
    const hints = earlyHints
      .map((e) => e.earlyHintLink.replace('; crossorigin', '')) // FIXME crashes node
    res.writeEarlyHints({
      link: hints,
    })
  }
  res.status(pageContext.statusCode ?? statusCode).type(contentType).send(body)
})

const port = process.env.PORT || 3000
app.listen(port)
console.log(`Server running at http://localhost:${port}`)
