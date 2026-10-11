import type { Payload } from 'payload'

import type { AccessRequestSubmission } from '@/payload-types'

/**
 * Overlap detection for reservation requests.
 *
 * This is advisory, not a lock. Two people can want the same room at the same
 * time for good reasons -- a shared event, a handover -- so the request is never
 * refused. The requester is asked to confirm, and the keyholder deciding it sees
 * a marker on the Telegram message.
 */

export interface TimeRange {
  start: Date
  end: Date
}

interface RangeFields {
  startDate?: string
  startTime?: string
  endDate?: string
  endTime?: string
}

/**
 * Build a range from the form's separate date and time fields. Returns null when
 * a piece is missing or unparseable, which means "cannot be compared" rather
 * than "no conflict".
 */
export const parseRange = (data: RangeFields): TimeRange | null => {
  if (!data.startDate || !data.endDate || !data.startTime || !data.endTime) {
    return null
  }

  const start = new Date(`${data.startDate}T${data.startTime}`)
  const end = new Date(`${data.endDate}T${data.endTime}`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null
  }

  return { start, end }
}

/**
 * Half-open comparison, so a booking ending at 18:00 and the next starting at
 * 18:00 do not count as overlapping. Back-to-back bookings are normal.
 */
export const rangesOverlap = (a: TimeRange, b: TimeRange): boolean =>
  a.start < b.end && b.start < a.end

/** Statuses that still hold the slot. A declined request releases it. */
const ACTIVE_STATUSES = ['pending', 'accepted']

export interface OverlapConflict {
  id: number | string
  submitterName: string
  status: string
  start: Date
  end: Date
}

/**
 * Requests for the same target whose time overlaps the given range.
 *
 * The times live inside the requestData JSON, which Postgres cannot be asked to
 * compare, so the candidates are narrowed by target and status and the overlap
 * is computed here. At this volume -- one association, a few hundred bookings a
 * year -- that is cheaper than maintaining indexed copies of the timestamps.
 */
export const findOverlappingRequests = async (args: {
  payload: Payload
  targetId: number | string
  range: TimeRange
  excludeId?: number | string
}): Promise<OverlapConflict[]> => {
  const { payload, targetId, range, excludeId } = args

  const existing = await payload.find({
    collection: 'access-request-submissions',
    where: {
      and: [{ target: { equals: targetId } }, { status: { in: ACTIVE_STATUSES } }],
    },
    depth: 0,
    limit: 1000,
    sort: '-sentAt',
  })

  const conflicts: OverlapConflict[] = []

  for (const doc of existing.docs as AccessRequestSubmission[]) {
    if (excludeId !== undefined && String(doc.id) === String(excludeId)) {
      continue
    }

    const other = parseRange((doc.requestData ?? {}) as RangeFields)

    if (!other || !rangesOverlap(range, other)) {
      continue
    }

    conflicts.push({
      id: doc.id,
      submitterName: doc.submitterName,
      status: doc.status ?? 'pending',
      start: other.start,
      end: other.end,
    })
  }

  return conflicts
}
