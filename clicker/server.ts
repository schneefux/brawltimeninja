import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

import CubejsServerCore from '@cubejs-backend/server-core'
// untyped
const ClickhouseDriver: any = require('@cubejs-backend/clickhouse-driver')

import ClickerService from './services/Clicker';
import { Player, BattleLog } from '~/model/Brawlstars';
import { Order } from './services/Cube';

const service = new ClickerService();

const app = express()
app.use(cors({ origin: '*' })) // TODO for development only
app.use(bodyParser.json({ limit: '50mb' }))

// error helper
const asyncMiddleware = (fn: (req: Request, res: Response, next: any) => Promise<void>) => (req: Request, res: Response, next: any) => Promise.resolve(fn(req, res, next)).catch(next)

app.get('/clicker/status', (req, res) => {
  res.json({ 'status': 'ok' })
})

app.post('/clicker/track', asyncMiddleware(async (req, res) => {
  await service.store(<{ player: Player, battleLog: BattleLog }> req.body)
  res.json({})
}))

app.get('/clicker/top/:metric', asyncMiddleware(async (req, res) => {
  res.header('Cache-Control', 'public, max-age=60')
  res.json(await service.getTopByMetric(req.params.metric, parseInt(req.query.limit as string) || 100))
}))

app.get('/clicker/top/:metric/brawler/:brawlerId', asyncMiddleware(async (req, res) => {
  res.header('Cache-Control', 'public, max-age=60')
  res.json(await service.getTopBrawlerByMetric(req.params.brawlerId, req.params.metric, parseInt(req.query.limit as string) || 100))
}))

app.get('/clicker/meta/map', async (req, res) => {
  res.header('Cache-Control', 'public, max-age=60')
  res.json(await service.getMapMeta(req.query.trophyrangeLower as string || '0', req.query.trophyrangeHigher as string || '9999'))
})

app.get('/clicker/cube/:cube/metadata', asyncMiddleware(async (req, res) => {
  res.header('Cache-Control', 'public, max-age=3600')
  res.json(service.getCubeMetadata(req.params.cube))
}))

app.get('/clicker/cube/:cube/query/:dimensions?', asyncMiddleware(async (req, res) => {
  const split = (n: string) => n.split(',').filter(p => p.length > 0)

  const cubeName = req.params.cube
  const dimensions = split(req.params.dimensions || '')
  const query = (req.query || {}) as { [name: string]: string }
  const measures = split(query['include'] || '*')
  const slices = Object.entries(query)
    .filter(([name, value]) => name.startsWith('slice[') && name.endsWith(']'))
    .reduce((slices, [name, value]) => ({ ...slices, [name.slice('slice['.length, -']'.length)]: value.split(',') }), {} as { [name: string]: string[] })
  const order = split(query['sort'] || '')
    .filter((name) => name.length > 0)
    .reduce((order, name) => ({
      ...order,
      ...((name.startsWith('-') ? ({ [name.slice(1)]: 'desc' }) : ({ [name]: 'asc' })) as { [name: string]: Order }),
    }), {} as Record<string, Order>)
  const limit = parseInt(query['limit']) || 1000
  const cache = parseInt(query['cache']) || 60
  const name = query['name']
  const format = query['format']

  res.header('Cache-Control', `public, max-age=${Math.max(Math.min(60*60*24, cache), 60)}`)
  try {
    res.json(await service.queryCube(cubeName, measures, dimensions, slices, order, limit, name, format))
  } catch (error) {
    console.error('error executing query', error)
    if (error instanceof Error) {
      res.json({ message: error.message })
    } else {
      res.json(error)
    }

    res.status(400)
  }
}))

const core = CubejsServerCore.create({
  dbType: 'clickhouse',
  // TODO: careful - driver uses shared session
  driverFactory: () => new ClickhouseDriver({
    host: process.env.CLICKHOUSE_HOST,
    database: 'brawltime',
    cacheAndQueueDriver: 'memory',
  }),
  apiSecret: 'secret', // TODO
  telemetry: false,
})
core.initApp(app)

const port = parseInt(process.env.PORT || '') || 3004
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
