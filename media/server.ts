import Koa from 'koa'
import cors from '@koa/cors'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'
import sharp from 'sharp'
import resolvePath from 'resolve-path'

const assetDir = process.env.ASSET_DIR || path.join(path.dirname(__dirname), 'assets')
const maxage = parseInt(process.env.CACHE_SECONDS || '86400')

const app = new Koa()

const fsStat = promisify(fs.stat)
let placeholder: Buffer

app.use(cors({ origin: '*' })); // TODO for development only
app.use(async (ctx, next) => {
  if (!(ctx.req.method == 'GET' && ctx.path == '/status')) {
    await next()
    return
  }

  ctx.body = ({ 'status': 'ok' })
})
app.use(async (ctx, next) => {
  if (ctx.method != 'GET') {
    await next()
    return
  }

  // adapted from koa-send and koa-static
  const requestPath = ctx.path

  const originalFullFilePath = decodeURIComponent(ctx.path)
  let filePath = resolvePath(assetDir, originalFullFilePath.substring(path.parse(originalFullFilePath).root.length))

  if (filePath.endsWith('.webp') || filePath.endsWith('.jpg')) {
    // images: prefer png if available
    const pngFilePath = filePath.replace(/\.(webp|jpg)$/g, '.png')
    try {
      await fsStat(pngFilePath)
      filePath = pngFilePath
    } catch (err: any) { }
  }

  let stats
  try {
    stats = await fsStat(filePath)
  } catch (err: any) {
    const notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR']
    if (notfound.includes(err.code)) {
      if (filePath.endsWith('.png')) {
        ctx.type = 'image/png'
        ctx.body = placeholder
      } else {
        ctx.throw(404, 'no such file or directory')
      }
      return
    }
    err.status = 500
    throw err
  }

  if (stats.isDirectory()) {
    ctx.throw(404, 'is a directory')
    return
  }

  const ext = path.extname(path.basename(requestPath))
  ctx.type = ext
  ctx.length = stats.size
  ctx.lastModified = stats.mtime
  ctx.set('Cache-Control', `public, max-age=${maxage}`)

  if (['.webp', '.jpg', '.png'].includes(ext)) {
    let transformer = sharp(filePath)
    if (typeof ctx.query.size == 'string') {
      const size = Math.max(1, Math.min(1000, parseInt(ctx.query.size)))
      transformer = transformer.resize(size)
    }
    if (ext == '.webp') {
      transformer = transformer.toFormat('webp')
    }
    if (ext == '.jpg') {
      transformer = transformer.toFormat('jpeg')
    }
    ctx.body = await transformer.toBuffer()
  } else {
    ctx.body = fs.createReadStream(filePath)
  }
})

const port = parseInt(process.env.PORT || '') || 3003

sharp({
  create: {
    width: 1,
    height: 1,
    channels: 4,
    background: { r: 0, b: 0, g: 0, alpha: 0.0 },
  }
}).png().toBuffer().then(b => {
  placeholder = b
  app.listen(port, () => {
    console.log(`listening on port ${port}`)
  })
})
