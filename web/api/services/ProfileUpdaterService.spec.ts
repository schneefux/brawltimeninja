import { test, beforeEach, expect, vi } from 'vitest'
import Knex from 'knex'
import ProfileUpdaterService from './ProfileUpdaterService'

const knex = Knex({
  client: 'better-sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
})

beforeEach(async () => {
  await knex.migrate.rollback()
  await knex.migrate.latest()
})

test('should track new profile', async () => {
  const profileUpdaterService = new ProfileUpdaterService(async () => new Date(), knex)

  const res = await profileUpdaterService.upsertProfileTrackingStatus('V8LLPPC', new Date())
  expect(res.status).toBe('active')
  expect(res.deletionToken).not.toBe('')

  const count = await knex('tracked_profile')
    .count('tag as count')
    .first()
  expect(count!.count).toBe(1)
})

test('should allow deletion of tracking status if deletion token is correct', async () => {
  const profileUpdaterService = new ProfileUpdaterService(async () => new Date(), knex)

  const now = new Date()
  await knex('tracked_profile').insert({
    tag: 'V8LLPPC',
    created_at: now,
    confirmed_at: now,
    last_updated_at: now,
    last_active_at: now,
    deletion_token: 'correcttoken',
  })

  const success = await profileUpdaterService.deleteProfileTrackingStatus('V8LLPPC', 'correcttoken')
  expect(success).toBe(true)

  const count = await knex('tracked_profile')
    .count('tag as count')
    .first()
  expect(count!.count).toBe(0)
})

test('should not allow deletion of tracking status if deletion token is wrong', async () => {
  const profileUpdaterService = new ProfileUpdaterService(async () => new Date(), knex)

  const now = new Date()
  await knex('tracked_profile').insert({
    tag: 'V8LLPPC',
    created_at: now,
    confirmed_at: now,
    last_updated_at: now,
    last_active_at: now,
    deletion_token: 'correcttoken',
  })

  const success = await profileUpdaterService.deleteProfileTrackingStatus('V8LLPPC', 'wrongtoken')
  expect(success).toBe(false)

  const count = await knex('tracked_profile')
    .count('tag as count')
    .first()
  expect(count!.count).toBe(1)
})

test('should should generate new token when updating profile', async () => {
  const profileUpdaterService = new ProfileUpdaterService(async () => new Date(), knex)

  const then = new Date()
  then.setMonth(then.getMonth() - 1)
  await knex('tracked_profile').insert({
    tag: 'V8LLPPC',
    created_at: then,
    confirmed_at: then,
    last_updated_at: then,
    last_active_at: then,
    deletion_token: 'oldtoken',
  })

  const res = await profileUpdaterService.upsertProfileTrackingStatus('V8LLPPC', new Date())
  expect(res.status).toBe('active')
  expect(res.deletionToken).not.toBe('oldtoken')
})

test('should return unknown profile status to inactive', async () => {
  const profileUpdaterService = new ProfileUpdaterService(async () => new Date(), knex)

  const status = await profileUpdaterService.getProfileTrackingStatus('UNKNOWN')
  expect(status).toBe('inactive')
})

test('should return recently added profile status to active', async () => {
  const profileUpdaterService = new ProfileUpdaterService(async () => new Date(), knex)

  const now = new Date()
  await knex('tracked_profile').insert({
    tag: 'V8LLPPC',
    created_at: now,
    confirmed_at: now,
    last_updated_at: now,
    last_active_at: now,
  })
  const status = await profileUpdaterService.getProfileTrackingStatus('V8LLPPC')
  expect(status).toBe('active')
})

test('should return old added profile status to expired', async () => {
  const profileUpdaterService = new ProfileUpdaterService(async () => new Date(), knex)

  const past = new Date()
  past.setFullYear(2000)

  await knex('tracked_profile').insert({
    tag: 'V8LLPPC',
    created_at: past,
    confirmed_at: past,
    last_updated_at: past,
    last_active_at: past,
  })
  const status = await profileUpdaterService.getProfileTrackingStatus('V8LLPPC')
  expect(status).toBe('expired')
})

test('should update tracked profile', async () => {
  let requests = 0
  const profileUpdaterService = new ProfileUpdaterService(async () => { requests++; return new Date(); }, knex)

  const now = new Date()
  const past = new Date()
  past.setFullYear(2000)
  await knex('tracked_profile').insert({
    tag: 'V8LLPPC',
    created_at: past,
    confirmed_at: now,
    last_updated_at: past,
    last_active_at: past,
  })
  await knex('tracked_profile').insert({
    tag: 'OLD',
    created_at: past,
    confirmed_at: past,
    last_updated_at: past,
    last_active_at: past,
  })

  await profileUpdaterService.updateAll()
  expect(requests).toBe(1)
  const profile = await knex('tracked_profile')
    .select('last_updated_at')
    .where('tag', 'V8LLPPC')
    .first()
  expect(profile!.last_updated_at.valueOf()).toBeGreaterThan(now.valueOf())
})

test('should handle error in update', async () => {
  const profileUpdaterService = new ProfileUpdaterService(() => { throw new Error(); }, knex)

  const now = new Date()
  const past = new Date()
  past.setFullYear(2000)
  const spy = vi.spyOn(console, 'error')
  spy.mockImplementation(() => {})
  await knex('tracked_profile').insert({
    tag: 'V8LLPPC',
    created_at: past,
    confirmed_at: now,
    last_updated_at: past,
    last_active_at: past,
  })

  await profileUpdaterService.updateAll()
  spy.mockRestore()
})

test('should update profile conditionally if tracked', async () => {
  const profileUpdaterService = new ProfileUpdaterService(async () => new Date(), knex)

  const then = new Date()
  then.setMinutes(then.getMinutes() - 10)
  await knex('tracked_profile').insert({
    tag: 'V8LLPPC',
    created_at: then,
    confirmed_at: then,
    last_updated_at: then,
    last_active_at: then,
  })

  await profileUpdaterService.updateProfileTrackingStatus('V8LLPPC', new Date())

  const count = await knex('tracked_profile')
    .count('tag as count')
    .where('last_updated_at', '>', then)
    .first()
  expect(count!.count).toBe(1)
})

test('should not update profile conditionally if not tracked', async () => {
  const profileUpdaterService = new ProfileUpdaterService(async () => new Date(), knex)

  await profileUpdaterService.updateProfileTrackingStatus('V8LLPPC', new Date())

  const count = await knex('tracked_profile')
    .count('tag as count')
    .first()
  expect(count!.count).toBe(0)
})
