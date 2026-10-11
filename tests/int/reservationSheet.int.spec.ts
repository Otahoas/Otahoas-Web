import { describe, it, expect } from 'vitest'

import type { AccessRequestSubmission, ReservationTarget } from '@/payload-types'
import { buildReservationRow, SHEET_STATUS } from '@/utilities/reservationSheet'

/**
 * These assertions encode the contract with the existing Apps Script
 * (findRow/newEvent). Column order, the status value it waits for and the two
 * sentinel strings are compared literally over there, so changing them silently
 * stops calendar events from being created.
 */

const target = {
  id: 1,
  emailPrefix: 'jmt10cd',
  labelFi: 'JMT10CD-kerhohuone',
  labelEn: 'JMT10CD club room',
  category: 'club-room',
  sheetVenueKey: 'JMT 10 CD',
} as unknown as ReservationTarget

const sentAt = new Date(2026, 9, 10, 14, 5, 30) // 10.10.2026 14:05:30 local
const handledAt = new Date(2026, 9, 11, 9, 30, 0) // 11.10.2026 09:30:00 local

const submission = (requestData: Record<string, unknown>) =>
  ({
    id: 42,
    submitterName: 'Matti Meikäläinen',
    submitterEmail: 'matti@example.com',
    sentAt: sentAt.toISOString(),
    requestData,
    target,
  }) as unknown as AccessRequestSubmission

const fullRequest = {
  startDate: '2026-11-01',
  startTime: '18:00',
  endDate: '2026-11-01',
  endTime: '23:00',
  association: 'no',
  isPublicEvent: 'no',
}

describe('buildReservationRow', () => {
  it('writes a pending row with the decision columns left empty', () => {
    const row = buildReservationRow({
      submission: submission(fullRequest),
      target,
      status: SHEET_STATUS.pending,
    })

    expect(row).toEqual([
      '2026-10-10 14:05:30',
      'Odottaa',
      'JMT 10 CD',
      'Matti Meikäläinen',
      'Ei ole yhdistys',
      '2026-11-01 18:00',
      '2026-11-01 23:00',
      'Ei ole yleinen tilaisuus',
      '',
      '',
      '42',
      '',
      '',
    ])
  })

  it('writes the approver and decision time on an accepted row', () => {
    const row = buildReservationRow({
      submission: submission(fullRequest),
      target,
      status: SHEET_STATUS.accepted,
      approverName: 'Anna Avaimellinen',
      handledAt,
    })

    expect(row[1]).toBe('Hyväksytty')
    expect(row[8]).toBe('Anna Avaimellinen')
    expect(row[9]).toBe('2026-10-11 09:30:00')
  })

  it('keeps the calendar columns empty so the Apps Script claims the row', () => {
    const row = buildReservationRow({
      submission: submission(fullRequest),
      target,
      status: SHEET_STATUS.accepted,
      approverName: 'Anna Avaimellinen',
      handledAt,
    })

    expect(row).toHaveLength(13)
    expect(row[11]).toBe('')
    expect(row[12]).toBe('')
  })

  it('carries the submission id so the row can be found again', () => {
    const row = buildReservationRow({
      submission: submission(fullRequest),
      target,
      status: SHEET_STATUS.pending,
    })

    expect(row[10]).toBe('42')
  })

  it('passes the association and public event names through when given', () => {
    const row = buildReservationRow({
      submission: submission({
        ...fullRequest,
        endDate: '2026-11-02',
        endTime: '02:00',
        association: 'yes',
        associationName: 'Otaniemen Sauna ry',
        isPublicEvent: 'yes',
        publicEventName: 'Saunailta',
      }),
      target,
      status: SHEET_STATUS.accepted,
      approverName: 'Anna Avaimellinen',
      handledAt,
    })

    expect(row[4]).toBe('Otaniemen Sauna ry')
    expect(row[7]).toBe('Saunailta')
  })

  it('falls back to the sentinels when a name is missing', () => {
    const row = buildReservationRow({
      submission: submission({
        ...fullRequest,
        association: 'yes',
        isPublicEvent: 'yes',
      }),
      target,
      status: SHEET_STATUS.pending,
    })

    expect(row[4]).toBe('Ei ole yhdistys')
    expect(row[7]).toBe('Ei ole yleinen tilaisuus')
  })

  it('refuses a target with no venue key rather than writing an orphan row', () => {
    expect(() =>
      buildReservationRow({
        submission: submission({ startDate: '2026-11-01', startTime: '18:00' }),
        target: { ...target, sheetVenueKey: null } as unknown as ReservationTarget,
        status: SHEET_STATUS.pending,
      }),
    ).toThrow(/sheetVenueKey/)
  })
})
