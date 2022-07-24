import { Knex } from 'knex'
import { StatsD } from 'hot-shots'

const stats = new StatsD({ prefix: 'brawltime.updater.' })

export type ProfileTrackingStatus = 'inactive'|'expired'|'active'

const TRACKING_EXPIRE_AFTER_DAYS = parseInt(process.env.TRACKING_EXPIRE_AFTER_DAYS ?? '14')
const TRACKING_REFRESH_MINUTES = parseInt(process.env.TRACKING_REFRESH_MINUTES ?? '1440')

export default class ProfileUpdaterService {
  constructor(
    private updateProfileCallback: ((tag: string) => Promise<Date|undefined>),
    private knex: Knex,
  ) { }

  public async updateProfileTrackingStatus(tag: string) {
    const date = await this.updateProfileCallback(tag)

    if (date == undefined) {
      throw {
        status: 400,
        reason: 'Cannot track profile with empty battle log, tag: ' + tag,
      }
    }

    console.log('updating tracker status for ' + tag)

    const now = new Date()

    await this.knex('tracked_profile')
      .insert({
        tag,
        created_at: now,
        confirmed_at: now,
        last_updated_at: now,
        last_active_at: date,
      })
      .onConflict('tag')
      .merge(['confirmed_at', 'last_updated_at', 'last_active_at'])
  }

  private getExpirationDate() {
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() - TRACKING_EXPIRE_AFTER_DAYS)
    return expirationDate;
  }

  public async getProfileTrackingStatus(tag: string): Promise<ProfileTrackingStatus|undefined> {
    let profile
    try {
      profile = await this.knex('tracked_profile')
        .select('confirmed_at')
        .where({
          tag,
        })
        .first()
    } catch (err) {
      console.error('could not query profile tracking status', tag, err)
      return undefined
    }

    if (profile == undefined) {
      return 'inactive'
    }

    if (profile.confirmed_at < this.getExpirationDate()) {
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
      const job = await this.knex('tracked_profile')
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

      console.log('updating tracked profile ' + job.tag)
      stats.increment('queue.total')
      summary.total++
      const success = await this.updateProfile(job.tag)
      if (success) {
        stats.increment('queue.success')
        summary.success++
      }
    }

    return summary
  }

  private async updateProfile(tag: string) {
    const now = new Date()
    const update: Record<string, Date|string> = {
      last_updated_at: now,
    }

    let success = true
    try {
      const date = await this.updateProfileCallback(tag)
      if (date != undefined) {
        update.last_active_at = date
      }
    } catch (error) {
      console.error('error updating profile ' + tag + ': ', error)
      success = false
    }

    await this.knex('tracked_profile')
      .update(update)
      .where('tag', tag)

    return success
  }
}
