import { describe, it, expect } from 'vitest'

import type { ReservationTarget } from '@/payload-types'
import {
  OVERLAP_BANNER,
  buildRequestMessage,
  type AccessRequestBody,
} from '@/utilities/reservationMessage'
import { parseRange, rangesOverlap } from '@/utilities/reservationOverlap'

const range = (startDate: string, startTime: string, endDate: string, endTime: string) => {
  const parsed = parseRange({ startDate, startTime, endDate, endTime })

  if (!parsed) {
    throw new Error('fixture did not parse')
  }

  return parsed
}

describe('parseRange', () => {
  it('combines the separate date and time fields', () => {
    const parsed = range('2026-11-01', '18:00', '2026-11-01', '23:00')

    expect(parsed.start.getHours()).toBe(18)
    expect(parsed.end.getHours()).toBe(23)
  })

  it('spans midnight when the end date is the next day', () => {
    const parsed = range('2026-11-01', '22:00', '2026-11-02', '02:00')

    expect(parsed.end.getTime() - parsed.start.getTime()).toBe(4 * 60 * 60 * 1000)
  })

  it('returns null when a field is missing or unparseable', () => {
    expect(parseRange({ startDate: '2026-11-01', startTime: '18:00' })).toBeNull()
    expect(parseRange({})).toBeNull()
    expect(
      parseRange({
        startDate: 'not a date',
        startTime: '18:00',
        endDate: '2026-11-01',
        endTime: '23:00',
      }),
    ).toBeNull()
  })
})

describe('rangesOverlap', () => {
  const booking = range('2026-11-01', '18:00', '2026-11-01', '23:00')

  it('detects a request starting inside an existing one', () => {
    expect(rangesOverlap(booking, range('2026-11-01', '20:00', '2026-11-01', '23:30'))).toBe(true)
  })

  it('detects a request ending inside an existing one', () => {
    expect(rangesOverlap(booking, range('2026-11-01', '16:00', '2026-11-01', '19:00'))).toBe(true)
  })

  it('detects a request fully containing an existing one', () => {
    expect(rangesOverlap(booking, range('2026-11-01', '12:00', '2026-11-02', '02:00'))).toBe(true)
  })

  it('detects an identical request', () => {
    expect(rangesOverlap(booking, range('2026-11-01', '18:00', '2026-11-01', '23:00'))).toBe(true)
  })

  it('allows a booking that starts exactly when the other ends', () => {
    // Back-to-back bookings are normal and must not warn, so the comparison is
    // half-open rather than inclusive.
    expect(rangesOverlap(booking, range('2026-11-01', '23:00', '2026-11-02', '01:00'))).toBe(false)
    expect(rangesOverlap(booking, range('2026-11-01', '15:00', '2026-11-01', '18:00'))).toBe(false)
  })

  it('allows a different day', () => {
    expect(rangesOverlap(booking, range('2026-11-02', '18:00', '2026-11-02', '23:00'))).toBe(false)
  })

  it('is symmetric', () => {
    const other = range('2026-11-01', '20:00', '2026-11-01', '21:00')

    expect(rangesOverlap(booking, other)).toBe(rangesOverlap(other, booking))
  })
})

describe('the overlap banner on the Telegram message', () => {
  const target = { labelEn: 'JMT10D music room' } as unknown as ReservationTarget
  const body = {
    name: 'Matti Meikäläinen',
    email: 'matti@example.com',
    startDate: '2026-11-01',
    startTime: '18:00',
    endDate: '2026-11-01',
    endTime: '23:00',
  } as unknown as AccessRequestBody

  it('sits on the first line, above the request itself', () => {
    const message = buildRequestMessage(body, target, { overlapWarning: true })

    // Whoever is about to press Accept has to see it before the details.
    expect(message.split('\n')[0]).toBe(OVERLAP_BANNER)
    expect(message).toContain('Matti Meikäläinen')
  })

  it('is absent when the request does not clash', () => {
    const message = buildRequestMessage(body, target, { overlapWarning: false })

    expect(message).not.toContain(OVERLAP_BANNER)
    expect(message.split('\n')[0]).toContain('Access Request')
  })

  it('is absent when nothing is passed, so an old submission reads unchanged', () => {
    expect(buildRequestMessage(body, target)).not.toContain(OVERLAP_BANNER)
  })
})
