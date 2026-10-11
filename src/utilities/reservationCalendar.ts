import type { Payload } from 'payload'

import type { AccessRequestSubmission, ReservationTarget } from '@/payload-types'

import {
  type EventTimes,
  deleteCalendarEvent,
  insertCalendarEvent,
  updateCalendarEvent,
} from './google/calendar'

/**
 * Calendar event content for a reservation.
 *
 * The wording reproduces what the retired Apps Script produced, string for
 * string, so taking calendar handling in-house did not rewrite the title of
 * every existing event the first time it was touched.
 */

/** Marks a booking that has not been approved yet. */
export const PENDING_TITLE_PREFIX = '⏳ NOT CONFIRMED: '
const PENDING_NOTICE = 'This booking is still awaiting approval.'
const USER_LABEL = 'User: '
const APPROVED_BY_LABEL = 'Approved by: '
const LOCATION_LABEL = 'Location: '

/** Sentinels the reservation sheet uses for "no association" / "not public". */
const NOT_AN_ASSOCIATION = 'Ei ole yhdistys'
const NOT_A_PUBLIC_EVENT = 'Ei ole yleinen tilaisuus'

/**
 * "Matti Juhani Meikäläinen" -> "M.J.M."
 *
 * Full names must never reach the calendars, which are embedded publicly on the
 * site. The regex is carried over from the retired Apps Script unchanged,
 * including its treatment of hyphens: "Anna-Liisa Virtanen" becomes "A-L.V." rather than
 * "A.L.V.". An empty cell yields an empty string instead of throwing.
 */
export const nameToInitials = (wholeName?: string | null): string => {
  const name = (wholeName ?? '').trim()

  if (!name) {
    return ''
  }

  const matches = name.match(/(^\S)|((\s|-)\S)/g)

  if (!matches) {
    return ''
  }

  return matches.join('').replace(/\s/g, '.').concat('.').toUpperCase()
}

interface RequestData {
  association?: string
  associationName?: string
  isPublicEvent?: string
  publicEventName?: string
}

/** Which of a reservation's events should exist, and what they say. */
export interface CalendarContent {
  /** The booking in the space's own calendar. */
  venue: { summary: string; description: string }
  /** The entry in the shared calendar, when this is a public event and approved. */
  general: { summary: string; description: string } | null
}

export const buildCalendarContent = (args: {
  submission: AccessRequestSubmission
  target: ReservationTarget
  /** Only an approved booking is confirmed; anything else is marked pending. */
  approved: boolean
}): CalendarContent => {
  const { submission, target, approved } = args
  const data = (submission.requestData ?? {}) as RequestData

  const venueName = target.sheetVenueKey
  const booker = nameToInitials(submission.submitterName)
  const approver = nameToInitials(submission.decidedBy)

  const association =
    data.association === 'yes' && data.associationName ? data.associationName : NOT_AN_ASSOCIATION

  const isAssociation = association !== NOT_AN_ASSOCIATION

  let summary = isAssociation ? `${venueName} (${association})` : `${venueName} (${booker})`

  let description = isAssociation
    ? `${USER_LABEL}${association} (${booker})`
    : `${USER_LABEL}${booker}`

  // The approver is unknown for as long as the booking is pending.
  if (approver) {
    description = `${description}\n${APPROVED_BY_LABEL}${approver}`
  }

  if (!approved) {
    summary = PENDING_TITLE_PREFIX.concat(summary)
    description = `${PENDING_NOTICE}\n\n${description}`
  }

  const publicEventName =
    data.isPublicEvent === 'yes' && data.publicEventName ? data.publicEventName : NOT_A_PUBLIC_EVENT

  // An unapproved event is not advertised in the shared calendar.
  const general =
    approved && publicEventName !== NOT_A_PUBLIC_EVENT
      ? { summary: publicEventName, description: `${LOCATION_LABEL}${venueName}` }
      : null

  return { venue: { summary, description }, general }
}

/**
 * The shared calendar public events are advertised in.
 *
 * Kept on the reservation-settings global rather than in the environment, so the
 * committee can change it without a deploy. It deliberately does not read the
 * CalendarEmbed block's publicEventsCalendarId: that is page content, there can
 * be several of them with different values, and editing a page should not move
 * where bookings are published.
 */
const getGeneralCalendarId = async (payload: Payload): Promise<string | null> => {
  const settings = await payload.findGlobal({ slug: 'reservation-settings' })

  return settings?.generalCalendarId?.trim() || null
}

interface TimeFields {
  startDate?: string
  startTime?: string
  endDate?: string
  endTime?: string
}

const toTimes = (submission: AccessRequestSubmission): EventTimes | null => {
  const data = (submission.requestData ?? {}) as TimeFields

  if (!data.startDate || !data.startTime || !data.endDate || !data.endTime) {
    return null
  }

  return {
    startDate: data.startDate,
    startTime: data.startTime,
    endDate: data.endDate,
    endTime: data.endTime,
  }
}

/**
 * Create, update or delete the event, whichever the desired state calls for.
 *
 * Returns the id the row should now carry: the existing one when it was patched,
 * a new one when it had to be recreated, or null when there should be no event.
 */
const reconcileEvent = async (args: {
  calendarId: string
  eventId?: string | null
  content: { summary: string; description: string } | null
  times: EventTimes
}): Promise<string | null> => {
  const { calendarId, eventId, content, times } = args

  if (!content) {
    if (eventId) {
      await deleteCalendarEvent({ calendarId, eventId })
    }

    return null
  }

  if (eventId) {
    const patched = await updateCalendarEvent({ calendarId, eventId, ...content, times })

    if (patched) {
      return eventId
    }
    // Deleted by hand; fall through and make a new one.
  }

  return insertCalendarEvent({ calendarId, ...content, times })
}

export interface CalendarSyncResult {
  eventId: string | null
  generalEventId: string | null
}

/**
 * Bring a reservation's calendar events in line with its status, immediately.
 *
 * This replaced a five-minute polling pass: a decision reaches the calendar in
 * the same request that records it. The caller treats a failure as
 * recoverable -- the decision itself still stands -- and flags the submission
 * rather than losing it.
 */
export const syncReservationCalendar = async (args: {
  payload: Payload
  submission: AccessRequestSubmission
  target: ReservationTarget
}): Promise<CalendarSyncResult> => {
  const { payload, submission, target } = args

  const times = toTimes(submission)

  if (!times) {
    throw new Error(`Reservation ${submission.id} has no complete start and end time`)
  }

  if (!target.googleCalendarId) {
    throw new Error(`Target "${target.emailPrefix}" has no googleCalendarId`)
  }

  const approved = submission.status === 'accepted'
  // Declined or cancelled: the booking releases the slot and leaves no trace.
  const booked = approved || submission.status === 'pending'

  const content = buildCalendarContent({ submission, target, approved })

  const eventId = await reconcileEvent({
    calendarId: target.googleCalendarId,
    eventId: submission.calendarEventId,
    content: booked ? content.venue : null,
    times,
  })

  const generalCalendarId = await getGeneralCalendarId(payload)
  let generalEventId = submission.calendarGeneralEventId ?? null

  if (generalCalendarId) {
    generalEventId = await reconcileEvent({
      calendarId: generalCalendarId,
      eventId: submission.calendarGeneralEventId,
      content: booked ? content.general : null,
      times,
    })
  } else if (content.general) {
    // Only worth saying when there was something to publish.
    payload.logger.warn(
      'No shared calendar is set in Reservation Settings, so public events reach no shared calendar',
    )
  }

  return { eventId, generalEventId }
}

/**
 * Sync and record the outcome on the submission.
 *
 * A calendar failure never fails the decision: the decision is already recorded,
 * and losing it because Google is unreachable would be far worse than a stale
 * calendar. The submission carries calendarSyncStatus so a failure is visible in
 * the admin rather than silent.
 */
export const syncAndRecordCalendar = async (args: {
  payload: Payload
  submission: AccessRequestSubmission
  target: ReservationTarget
}): Promise<{ ok: boolean; error?: string }> => {
  const { payload, submission } = args

  try {
    const { eventId, generalEventId } = await syncReservationCalendar(args)

    await payload.update({
      collection: 'access-request-submissions',
      id: submission.id,
      data: {
        calendarEventId: eventId,
        calendarGeneralEventId: generalEventId,
        calendarSyncStatus: 'written',
        calendarError: null,
      },
    })

    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    payload.logger.error(`Calendar sync failed for reservation ${submission.id}: ${message}`)

    await payload.update({
      collection: 'access-request-submissions',
      id: submission.id,
      data: { calendarSyncStatus: 'failed', calendarError: message },
    })

    return { ok: false, error: message }
  }
}
