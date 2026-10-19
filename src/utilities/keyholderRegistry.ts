import type { Payload } from 'payload'

import {
  normalizeUsername,
  readKeyholderSheet,
  writeTelegramUserId,
  type KeyholderRow,
  type KeyholderSheet,
} from './google/keyholders'

/**
 * Who may press the reservation buttons.
 *
 * The keyholder tab in Google Sheets is the source of truth: the committee
 * maintains it by hand. Telegram has no username-to-ID lookup, so the ID column
 * is filled in on a person's first button press and matched by ID from then on
 * -- a later username change does not need a sheet edit.
 *
 * A snapshot is kept in Payload so a Google outage degrades to slightly stale
 * permissions instead of nobody being able to accept anything.
 */

const CACHE_TTL_MS = 60_000

let memo: { sheet: KeyholderSheet; readAt: number } | null = null

export class RegistryUnavailableError extends Error {}

const persistSnapshot = async (payload: Payload, rows: KeyholderRow[]): Promise<void> => {
  try {
    await payload.updateGlobal({
      slug: 'reservation-settings',
      data: {
        keyholderCache: rows,
        keyholderCacheUpdatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    payload.logger.error(`Failed to cache the keyholder registry: ${String(error)}`)
  }
}

const readSnapshot = async (payload: Payload): Promise<KeyholderRow[]> => {
  const settings = await payload.findGlobal({ slug: 'reservation-settings' })
  const cached = settings?.keyholderCache

  return Array.isArray(cached) ? (cached as KeyholderRow[]) : []
}

const loadSheet = async (payload: Payload): Promise<KeyholderSheet> => {
  if (memo && Date.now() - memo.readAt < CACHE_TTL_MS) {
    return memo.sheet
  }

  try {
    const sheet = await readKeyholderSheet()
    memo = { sheet, readAt: Date.now() }
    await persistSnapshot(payload, sheet.rows)

    return sheet
  } catch (error) {
    payload.logger.error(`Could not read the keyholder tab: ${String(error)}`)

    const rows = await readSnapshot(payload)

    if (rows.length === 0) {
      throw new RegistryUnavailableError('Keyholder registry is unreachable and no cache exists')
    }

    // Stale, but better than refusing every press while Google is down.
    return { rows, userIdColumn: null }
  }
}

export interface Actor {
  found: boolean
  name: string
  isCommittee: boolean
  /** True when this press is what resolved the person's Telegram ID. */
  bound: boolean
  /** Contact details passed on to the requester; empty when unknown. */
  email: string
  username: string
}

export const resolveActor = async (args: {
  payload: Payload
  telegramUserId: string
  username?: string
  displayName: string
}): Promise<Actor> => {
  const { payload, telegramUserId, username, displayName } = args
  const sheet = await loadSheet(payload)

  const normalized = normalizeUsername(username)
  const byId = sheet.rows.find((row) => row.telegramUserId.trim() === telegramUserId)

  if (byId) {
    return {
      found: true,
      name: byId.name || displayName,
      isCommittee: byId.isCommittee,
      bound: false,
      // Snapshots cached before the email column was read have no email.
      email: byId.email ?? '',
      username: byId.username || normalized,
    }
  }

  const notFound: Actor = {
    found: false,
    name: displayName,
    isCommittee: false,
    bound: false,
    email: '',
    username: normalized,
  }

  // No ID on file yet: fall back to the username the committee typed, once.
  if (!normalized) {
    return notFound
  }

  const byUsername = sheet.rows.find(
    (row) => row.username === normalized && !row.telegramUserId.trim(),
  )

  if (!byUsername) {
    return notFound
  }

  let bound = false

  if (sheet.userIdColumn) {
    try {
      await writeTelegramUserId({
        rowNumber: byUsername.rowNumber,
        column: sheet.userIdColumn,
        telegramUserId,
      })

      // Keep the in-memory copy in step, so a second press matches by ID.
      byUsername.telegramUserId = telegramUserId
      await persistSnapshot(payload, sheet.rows)
      bound = true
    } catch (error) {
      payload.logger.error(
        `Failed to write Telegram ID back to the keyholder tab: ${String(error)}`,
      )
    }
  } else {
    payload.logger.warn(
      'Keyholder tab has no Telegram ID column, so IDs cannot be remembered. Add one named "Telegram ID".',
    )
  }

  return {
    found: true,
    name: byUsername.name || displayName,
    isCommittee: byUsername.isCommittee,
    bound,
    email: byUsername.email ?? '',
    username: byUsername.username,
  }
}
