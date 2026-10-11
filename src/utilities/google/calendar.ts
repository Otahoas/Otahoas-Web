import { google } from 'googleapis'

import { getGoogleAuth } from './auth'

const SCOPES = ['https://www.googleapis.com/auth/calendar']

const getCalendarClient = () => google.calendar({ version: 'v3', auth: getGoogleAuth(SCOPES) })

/**
 * The zone the form's dates and times are meant in.
 *
 * This matters more than it looks. The form collects "18:00" with no zone, and
 * the server runs in a container whose clock is UTC. Turning that into a Date
 * and sending an instant would book 18:00 UTC, which is 20:00 or 21:00 in
 * Helsinki depending on the season -- every booking silently wrong, and wrong by
 * a different amount in summer. Sending the naive local time together with an
 * explicit zone lets Google resolve it in the zone the booking was meant in.
 */
export const RESERVATION_TIME_ZONE = process.env.RESERVATION_TIME_ZONE?.trim() || 'Europe/Helsinki'

export interface EventTimes {
  startDate: string
  startTime: string
  endDate: string
  endTime: string
}

const toEventDateTime = (date: string, time: string) => ({
  dateTime: `${date}T${time}:00`,
  timeZone: RESERVATION_TIME_ZONE,
})

const toEventBody = (args: { summary: string; description: string; times: EventTimes }) => ({
  summary: args.summary,
  description: args.description,
  start: toEventDateTime(args.times.startDate, args.times.startTime),
  end: toEventDateTime(args.times.endDate, args.times.endTime),
})

/** Google reports a vanished event as 404 or, once cancelled, 410. */
const isGone = (error: unknown): boolean => {
  const code =
    (error as { code?: number; status?: number })?.code ?? (error as { status?: number })?.status

  return code === 404 || code === 410
}

export const insertCalendarEvent = async (args: {
  calendarId: string
  summary: string
  description: string
  times: EventTimes
}): Promise<string> => {
  const calendar = getCalendarClient()

  const response = await calendar.events.insert({
    calendarId: args.calendarId,
    requestBody: toEventBody(args),
  })

  const id = response.data.id

  if (!id) {
    throw new Error('Calendar did not return an event id')
  }

  return id
}

/**
 * Patch an existing event in place.
 *
 * Updating rather than recreating keeps the event id stable, so approving a
 * booking does not look to anyone watching the calendar like it disappeared and
 * came back. Returns false when the event is no longer there -- someone deleted
 * it by hand -- so the caller can create a fresh one.
 */
export const updateCalendarEvent = async (args: {
  calendarId: string
  eventId: string
  summary: string
  description: string
  times: EventTimes
}): Promise<boolean> => {
  const calendar = getCalendarClient()

  try {
    await calendar.events.patch({
      calendarId: args.calendarId,
      eventId: args.eventId,
      requestBody: toEventBody(args),
    })

    return true
  } catch (error) {
    if (isGone(error)) {
      return false
    }

    throw error
  }
}

/** Deleting something already gone is the desired end state, not a failure. */
export const deleteCalendarEvent = async (args: {
  calendarId: string
  eventId: string
}): Promise<void> => {
  const calendar = getCalendarClient()

  try {
    await calendar.events.delete({ calendarId: args.calendarId, eventId: args.eventId })
  } catch (error) {
    if (!isGone(error)) {
      throw error
    }
  }
}
