import { describe, it, expect } from 'vitest'

import type { AccessRequestSubmission, ReservationTarget } from '@/payload-types'
import {
  PENDING_TITLE_PREFIX,
  buildCalendarContent,
  nameToInitials,
} from '@/utilities/reservationCalendar'

/**
 * These pin the wording the Apps Script produced. Moving calendar handling
 * in-house must not rewrite the title of every existing event, and full names
 * must never reach calendars that are embedded on the public site.
 */

const target = {
  emailPrefix: 'jmt10cd',
  sheetVenueKey: 'JMT 10 CD',
} as unknown as ReservationTarget

const submission = (requestData: Record<string, unknown>, extra: Record<string, unknown> = {}) =>
  ({
    id: 42,
    submitterName: 'Matti Juhani Meikäläinen',
    requestData,
    ...extra,
  }) as unknown as AccessRequestSubmission

describe('nameToInitials', () => {
  it('reduces a name to initials', () => {
    expect(nameToInitials('Matti Juhani Meikäläinen')).toBe('M.J.M.')
    expect(nameToInitials('Anna Virtanen')).toBe('A.V.')
  })

  it('keeps a hyphen, exactly as the Apps Script did', () => {
    expect(nameToInitials('Anna-Liisa Virtanen')).toBe('A-L.V.')
  })

  it('returns an empty string for a missing name instead of throwing', () => {
    expect(nameToInitials('')).toBe('')
    expect(nameToInitials('   ')).toBe('')
    expect(nameToInitials(null)).toBe('')
    expect(nameToInitials(undefined)).toBe('')
  })

  it('never leaks a full name', () => {
    expect(nameToInitials('Matti Meikäläinen')).not.toContain('Matti')
  })
})

describe('buildCalendarContent', () => {
  const personal = { association: 'no', isPublicEvent: 'no' }

  it('marks a pending booking in the title and the description', () => {
    const { venue, general } = buildCalendarContent({
      submission: submission(personal),
      target,
      approved: false,
    })

    expect(venue.summary).toBe(`${PENDING_TITLE_PREFIX}JMT 10 CD (M.J.M.)`)
    expect(venue.description).toContain('awaiting approval')
    expect(venue.description).toContain('User: M.J.M.')
    expect(general).toBeNull()
  })

  it('drops the marking once approved and names the approver', () => {
    const { venue } = buildCalendarContent({
      submission: submission(personal, { decidedBy: 'Anna Avaimellinen' }),
      target,
      approved: true,
    })

    expect(venue.summary).toBe('JMT 10 CD (M.J.M.)')
    expect(venue.description).toBe('User: M.J.M.\nApproved by: A.A.')
  })

  it('shows the association by name and the booker as initials', () => {
    const { venue } = buildCalendarContent({
      submission: submission({
        association: 'yes',
        associationName: 'Otaniemen Sauna ry',
        isPublicEvent: 'no',
      }),
      target,
      approved: true,
    })

    expect(venue.summary).toBe('JMT 10 CD (Otaniemen Sauna ry)')
    expect(venue.description).toBe('User: Otaniemen Sauna ry (M.J.M.)')
  })

  it('adds the shared calendar entry for an approved public event', () => {
    const { general } = buildCalendarContent({
      submission: submission({
        association: 'no',
        isPublicEvent: 'yes',
        publicEventName: 'Saunailta',
      }),
      target,
      approved: true,
    })

    expect(general).toEqual({ summary: 'Saunailta', description: 'Location: JMT 10 CD' })
  })

  it('withholds the shared calendar entry while the public event is pending', () => {
    // An unapproved event must not be advertised.
    const { general } = buildCalendarContent({
      submission: submission({
        association: 'no',
        isPublicEvent: 'yes',
        publicEventName: 'Saunailta',
      }),
      target,
      approved: false,
    })

    expect(general).toBeNull()
  })

  it('omits the approver line while nobody has decided', () => {
    const { venue } = buildCalendarContent({
      submission: submission(personal),
      target,
      approved: false,
    })

    expect(venue.description).not.toContain('Approved by')
  })
})
