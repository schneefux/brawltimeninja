import Knex from 'knex'
import BrawlstarsService from './BrawlstarsService'
import StatsD from 'hot-shots'
import knexfile from '../knexfile'

const TRACKING_EXPIRE_AFTER_DAYS = parseInt(process.env.TRACKING_EXPIRE_AFTER_DAYS ?? '14')
const TRACKING_REFRESH_MINUTES = parseInt(process.env.TRACKING_REFRESH_MINUTES ?? '1440')
const stats = new StatsD({ prefix: 'brawltime.tracker.' })
const environment = process.env.ENVIRONMENT || 'development'

export default class TrackerService {
  constructor(
    private knex = Knex(knexfile[environment]),
    private brawlstarsService = new BrawlstarsService(),
  ) { }

  public async updatePlayerTrackingStatus(tag: string) {
    const data = await this.brawlstarsService.getPlayerStatistics(tag, true)
    if (data.battles.length == 0) {
      throw {
        status: 400,
        reason: 'Cannot track player with empty battle log, tag: ' + tag,
      }
    }

    console.log('updating tracker status for ' + tag)
    const lastBattleDate = data.battles[0].timestamp

    const now = new Date()

    await this.knex('tracked_players')
      .insert({
        tag,
        created_at: now,
        confirmed_at: now,
        last_updated_at: now,
        last_active_at: lastBattleDate,
      })
      .onConflict('tag')
      .merge(['confirmed_at', 'last_updated_at', 'last_active_at'])
  }

  private getExpirationDate() {
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() - TRACKING_EXPIRE_AFTER_DAYS)
    return expirationDate;
  }

  public async getPlayerTrackingStatus(tag: string): Promise<'inactive'|'expired'|'active'> {
    const player = await this.knex('tracked_players')
      .select('confirmed_at')
      .where({
        tag,
      })
      .first()

    if (player == undefined) {
      return 'inactive'
    }

    if (player.confirmed_at < this.getExpirationDate()) {
      return 'expired'
    }

    return 'active'
  }

  public async updateAll() {
    const summary = {
      total: 0,
      success: 0,
    }

    while (true) {
      const job = await this.knex('tracked_players')
        .where('confirmed_at', '>=', this.getExpirationDate())
        .andWhere(
          this.knex.client.config.client != 'better-sqlite3' ? this.knex.raw('TIMESTAMPDIFF(MINUTE, last_updated_at, NOW())') : this.knex.raw('(JulianDay(datetime(\'now\')) - JulianDay(datetime(last_updated_at / 1000, \'unixepoch\'))) * 24 * 60'),
          '>',
          TRACKING_REFRESH_MINUTES,
        )
        .select('tag')
        .orderBy('last_updated_at', 'asc')
        .first()

      if (job == undefined) {
        break
      }

      console.error('updating tracked player ' + job.tag)
      stats.increment('queue.total')
      summary.total++
      const success = await this.updatePlayer(job.tag)
      if (success) {
        stats.increment('queue.success')
        summary.success++
      }
    }

    return summary
  }

  private async updatePlayer(tag: string) {
    const now = new Date()
    const update: Record<string, Date|string> = {
      last_updated_at: now,
    }

    let success = true
    try {
      const data = await this.brawlstarsService.getPlayerStatistics(tag, true)
      if (data.battles.length > 0) {
        const lastBattleDate = data.battles[0].timestamp
        update.last_active_at = lastBattleDate
      }
    } catch (error) {
      console.error('error updating player ' + tag + ': ', error)
      success = false
    }

    await this.knex('tracked_players')
      .update(update)
      .where('tag', tag)

    return success
  }
}
