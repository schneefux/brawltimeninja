import Knex from 'knex'
import BrawlstarsService from './BrawlstarsService'
import TrackerService from './ProfileUpdateService'

const knex = Knex({
  client: 'better-sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
})
const brawlstarsService = new BrawlstarsService()

beforeEach(async () => {
  await knex.migrate.rollback()
  await knex.migrate.latest()
})

test('should track new player', async () => {
  class Stub extends BrawlstarsService {
    public async getPlayerStatistics(): Promise<any> {
      return {
        battles: [{ timestamp: new Date() }]
      }
    }
  }

  const trackerService = new TrackerService(knex, new Stub())

  await trackerService.updatePlayerTrackingStatus('V8LLPPC')
  const count = await knex('tracked_players')
    .count('tag as count')
    .first()
  expect(count!.count).toBe(1)
})

test('should not track player that does not exist', async () => {
  class Stub extends BrawlstarsService {
    public async getPlayerStatistics(): Promise<any> {
      throw { status: 404, reason: 'Does not exist' }
    }
  }

  const trackerService = new TrackerService(knex, new Stub())

  expect(trackerService.updatePlayerTrackingStatus('V8LLPPC'))
    .rejects.not.toBeNull()

  const count = await knex('tracked_players')
    .count('tag as count')
    .first()
  expect(count!.count).toBe(0)
})

test('should return unknown player status to inactive', async () => {
  const trackerService = new TrackerService(knex, brawlstarsService)

  const status = await trackerService.getPlayerTrackingStatus('UNKNOWN')
  expect(status).toBe('inactive')
})

test('should return recently added player status to active', async () => {
  const trackerService = new TrackerService(knex, brawlstarsService)

  const now = new Date()
  await knex('tracked_players').insert({
    tag: 'V8LLPPC',
    created_at: now,
    confirmed_at: now,
    last_updated_at: now,
    last_active_at: now,
  })
  const status = await trackerService.getPlayerTrackingStatus('V8LLPPC')
  expect(status).toBe('active')
})

test('should return old added player status to expired', async () => {
  const trackerService = new TrackerService(knex, brawlstarsService)

  const past = new Date()
  past.setFullYear(2000)

  await knex('tracked_players').insert({
    tag: 'V8LLPPC',
    created_at: past,
    confirmed_at: past,
    last_updated_at: past,
    last_active_at: past,
  })
  const status = await trackerService.getPlayerTrackingStatus('V8LLPPC')
  expect(status).toBe('expired')
})

test('should update tracked player', async () => {
  let requests = 0
  class Stub extends BrawlstarsService {
    public async getPlayerStatistics(): Promise<any> {
      requests++
      return {
        battles: [{ timestamp: new Date() }]
      }
    }
  }

  const trackerService = new TrackerService(knex, new Stub())

  const now = new Date()
  const past = new Date()
  past.setFullYear(2000)
  await knex('tracked_players').insert({
    tag: 'V8LLPPC',
    created_at: past,
    confirmed_at: now,
    last_updated_at: past,
    last_active_at: past,
  })
  await knex('tracked_players').insert({
    tag: 'OLD',
    created_at: past,
    confirmed_at: past,
    last_updated_at: past,
    last_active_at: past,
  })

  await trackerService.updateAll()
  expect(requests).toBe(1)
  const player = await knex('tracked_players')
    .select('last_updated_at')
    .where('tag', 'V8LLPPC')
    .first()
  expect(player!.last_updated_at.valueOf()).toBeGreaterThan(now.valueOf())
})

test('should handle error in update', async () => {
  class Stub extends BrawlstarsService {
    public async getPlayerStatistics(): Promise<any> {
      throw { status: 500, reason: 'maintenance' }
    }
  }

  const trackerService = new TrackerService(knex, new Stub())

  const now = new Date()
  const past = new Date()
  past.setFullYear(2000)
  await knex('tracked_players').insert({
    tag: 'V8LLPPC',
    created_at: past,
    confirmed_at: now,
    last_updated_at: past,
    last_active_at: past,
  })

  await trackerService.updateAll()
})
