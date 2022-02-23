import express, { Request, Response } from 'express'
import cors from 'cors'
import ClickerService from './services/Clicker';
import { Player, BattleLog } from '~/model/Brawlstars';

const service = new ClickerService();

const app = express()
app.use(cors({ origin: '*' })) // TODO for development only
app.use(express.json({ limit: '50mb' }))

// error helper
const asyncMiddleware = (fn: (req: Request, res: Response, next: any) => Promise<void>) => (req: Request, res: Response, next: any) => Promise.resolve(fn(req, res, next)).catch(next)

app.get('/clicker/status', (req, res) => {
  res.json({ 'status': 'ok' })
})

app.post('/clicker/track', asyncMiddleware(async (req, res) => {
  await service.store(<{ player: Player, battleLog: BattleLog }> req.body)
  res.json({})
}))

const port = parseInt(process.env.PORT || '') || 3004
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
