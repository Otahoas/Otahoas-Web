import type { AccessRequestSubmission, ReservationTarget } from '@/payload-types'

import { appendRow, readCell, readColumn, updateRanges } from './google/sheets'

/**
 * The reservation sheet is a write-only mirror owned by this app. A row is
 * appended the moment a request arrives, and the Telegram buttons patch its
 * status afterwards.
 *
 * The Apps Script (syncCalendar, on a 5-minute time-driven trigger) reconciles
 * each row's calendar events with its status: pending shows up marked as
 * unconfirmed, accepted as a normal booking, and declined or cancelled is
 * removed. It notices a change by comparing the status column with column N,
 * where it records what it last pushed. When calendar handling moves in-house,
 * this file is the single swap point.
 *
 * Sheet columns, in order:
 *   A  1 Timestamp                      -- when the request arrived
 *   B  2 Varauksen status               -- patched on every decision
 *   C  3 Varattava tila                 -- must match the Apps Script calendarIDs keys
 *   D  4 Tilan käyttäjän nimi           -- requester, shortened to initials by the script
 *   E  5 Tilan käyttäjän yhdistys       -- or the "not an association" sentinel
 *   F  6 Varaus alkaa
 *   G  7 Varaus päättyy
 *   H  8 Yleinen tilaisuus              -- or the "not a public event" sentinel
 *   I  9 Hyväksyjä                      -- the keyholder who accepted, initials in the calendar
 *   J 10 Käsitelty                      -- when the decision was made
 *   K 11 Varaus-ID                      -- the submission id, how a row is found again
 *   L 12 Google Calendar Event ID         -- the script owns it
 *   M 13 Google Calendar General Event ID -- the script owns it
 *   N 14 Kalenterin tila                  -- the script owns it
 *
 * Appends deliberately stop at M so column N stays blank on a new row, which is
 * what makes the script treat it as not yet synced.
 */

/** Sentinels the Apps Script compares against. Changing these breaks it. */
const NOT_AN_ASSOCIATION = 'Ei ole yhdistys'
const NOT_A_PUBLIC_EVENT = 'Ei ole yleinen tilaisuus'

/**
 * Status column values. The Apps Script compares against ACCEPTED literally, so
 * these strings are part of the contract with it.
 */
export const SHEET_STATUS = {
  pending: 'Odottaa',
  accepted: 'Hyväksytty',
  declined: 'Hylätty',
  cancelled: 'Peruttu',
} as const

export type SheetStatus = (typeof SHEET_STATUS)[keyof typeof SHEET_STATUS]

const STATUS_CELL = 'B'
const DECISION_RANGE = ['I', 'J'] as const
const ID_COLUMN = 'K'

interface RequestData {
  association?: string
  associationName?: string
  isPublicEvent?: string
  publicEventName?: string
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
}

/**
 * "2026-10-09 18:00". Sheets parses this into a datetime under USER_ENTERED,
 * and if it ever lands as plain text the Apps Script's `new Date(...)` still
 * reads it correctly.
 */
const formatDateTime = (date?: string, time?: string): string => {
  if (!date) {
    return ''
  }

  return time ? `${date} ${time}` : date
}

const formatTimestamp = (date: Date): string => {
  const pad = (value: number): string => String(value).padStart(2, '0')

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

interface RowArgs {
  submission: AccessRequestSubmission
  target: ReservationTarget
  status: SheetStatus
  approverName?: string | null
  handledAt?: Date | null
}

export const buildReservationRow = (args: RowArgs): string[] => {
  const { submission, target, status, approverName, handledAt } = args
  const data = (submission.requestData ?? {}) as RequestData

  if (!target.sheetVenueKey) {
    throw new Error(
      `Target "${target.emailPrefix}" has no sheetVenueKey, so the Apps Script cannot resolve a calendar`,
    )
  }

  const association =
    data.association === 'yes' && data.associationName ? data.associationName : NOT_AN_ASSOCIATION

  const publicEvent =
    data.isPublicEvent === 'yes' && data.publicEventName ? data.publicEventName : NOT_A_PUBLIC_EVENT

  const submittedAt = submission.sentAt ? new Date(submission.sentAt) : new Date()

  return [
    formatTimestamp(submittedAt),
    status,
    target.sheetVenueKey,
    submission.submitterName,
    association,
    formatDateTime(data.startDate, data.startTime),
    formatDateTime(data.endDate, data.endTime),
    publicEvent,
    approverName ?? '',
    handledAt ? formatTimestamp(handledAt) : '',
    String(submission.id),
    '',
    '',
  ]
}

export interface RecordResult {
  rowNumber?: number
}

/**
 * Append the row for a request that has just arrived. It carries status
 * "Odottaa", so the Apps Script leaves it alone until someone accepts.
 */
export const recordPendingReservation = async (args: {
  submission: AccessRequestSubmission
  target: ReservationTarget
}): Promise<RecordResult> =>
  appendRow(buildReservationRow({ ...args, status: SHEET_STATUS.pending }))

/**
 * Find the row belonging to a submission.
 *
 * The stored row number is only a hint: a committee member inserting or
 * deleting rows by hand shifts everything below. It is therefore verified
 * against the ID column before being used, because patching the wrong row would
 * silently corrupt somebody else's booking. Only if that check fails does this
 * fall back to scanning the column.
 */
const locateRow = async (submission: AccessRequestSubmission): Promise<number | undefined> => {
  const id = String(submission.id)

  if (submission.sheetRowNumber) {
    const stored = await readCell(`${ID_COLUMN}${submission.sheetRowNumber}`)

    if (stored === id) {
      return submission.sheetRowNumber
    }
  }

  const column = await readColumn(ID_COLUMN)
  const index = column.findIndex((value) => value === id)

  return index === -1 ? undefined : index + 1
}

/**
 * Patch the status, approver and decision time of an existing row.
 *
 * If no row can be found the whole row is appended instead. That covers both a
 * failed pending write and a button pressed before the append landed, so a
 * decision never goes unrecorded just because the mirror fell behind.
 */
export const recordDecision = async (args: {
  submission: AccessRequestSubmission
  target: ReservationTarget
  status: SheetStatus
  decidedByName?: string | null
  decidedAt?: Date | null
}): Promise<RecordResult> => {
  const { submission, target, status, decidedByName, decidedAt } = args

  const row = await locateRow(submission)

  if (!row) {
    return appendRow(
      buildReservationRow({
        submission,
        target,
        status,
        approverName: decidedByName,
        handledAt: decidedAt,
      }),
    )
  }

  await updateRanges([
    { range: `${STATUS_CELL}${row}`, values: [status] },
    {
      range: `${DECISION_RANGE[0]}${row}:${DECISION_RANGE[1]}${row}`,
      values: [decidedByName ?? '', decidedAt ? formatTimestamp(decidedAt) : ''],
    },
  ])

  return { rowNumber: row }
}
