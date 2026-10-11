import { google } from 'googleapis'

import { getGoogleAuth } from './auth'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

const getSheetsClient = () => google.sheets({ version: 'v4', auth: getGoogleAuth(SCOPES) })

/**
 * The keyholder registry lives in its own spreadsheet, separate from the
 * reservations one. Falls back to the reservations file for the case where both
 * end up in one document.
 */
const getSpreadsheetId = (): string => {
  const id = process.env.GOOGLE_SHEETS_KEYHOLDERS_ID?.trim() || process.env.GOOGLE_SHEETS_ID?.trim()

  if (!id) {
    throw new Error('GOOGLE_SHEETS_KEYHOLDERS_ID is not set')
  }

  return id
}

/** Resolved by tab name, so the tab order in the keyholder file does not matter. */
const DEFAULT_TAB = 'Avaimelliset'

const getTabName = (): string => process.env.GOOGLE_SHEETS_KEYHOLDERS_TAB?.trim() || DEFAULT_TAB

export interface KeyholderRow {
  /** 1-based sheet row, so a bound ID can be written back to the right cell. */
  rowNumber: number
  name: string
  username: string
  telegramUserId: string
  isCommittee: boolean
}

/**
 * Columns are matched by header name, not position, so the committee can
 * reorder or insert columns in the sheet without breaking anything.
 */
const HEADERS = {
  name: ['nimi'],
  committee: ['atmk-jasen', 'atmk jasen', 'atmkjasen', 'committee'],
  username: ['telegram'],
  userId: ['telegram id', 'telegram id (automaattinen)', 'telegram uuid', 'telegram user id'],
}

/** Lowercase, collapse whitespace, and fold the Finnish vowels so "ATMK-jäsen" matches. */
const normalizeHeader = (value: string): string =>
  value.trim().toLowerCase().replace(/[äå]/g, 'a').replace(/ö/g, 'o').replace(/\s+/g, ' ')

const findColumn = (headers: string[], candidates: string[]): number =>
  headers.findIndex((header) => candidates.includes(normalizeHeader(header)))

/**
 * A real Sheets checkbox comes back as the sheet's own locale renders it, so a
 * Finnish spreadsheet sends TOSI rather than TRUE. Hand-typed markers are
 * accepted too, since the column is maintained by hand.
 */
const TRUTHY = ['true', 'tosi', '1', 'x', 'kyllä', 'kylla', 'k', 'yes', 'y']

const isTruthy = (value: string | undefined): boolean =>
  TRUTHY.includes((value ?? '').trim().toLowerCase())

export const normalizeUsername = (value: string | undefined): string =>
  (value ?? '').trim().replace(/^@/, '').toLowerCase()

/** Column index (0-based) to an A1 letter: 0 -> A, 26 -> AA. */
const columnLetter = (index: number): string => {
  let result = ''
  let current = index

  while (current >= 0) {
    result = String.fromCharCode((current % 26) + 65) + result
    current = Math.floor(current / 26) - 1
  }

  return result
}

export interface KeyholderSheet {
  rows: KeyholderRow[]
  /** A1 letter of the Telegram ID column, needed to bind an ID later. */
  userIdColumn: string | null
}

/** Split out from the API call so the header matching can be tested directly. */
export const parseKeyholderSheet = (values: unknown[][], tab = 'keyholders'): KeyholderSheet => {
  if (values.length === 0) {
    return { rows: [], userIdColumn: null }
  }

  const headers = (values[0] ?? []).map((header) => String(header ?? ''))
  const nameIndex = findColumn(headers, HEADERS.name)
  const usernameIndex = findColumn(headers, HEADERS.username)
  const userIdIndex = findColumn(headers, HEADERS.userId)
  const committeeIndex = findColumn(headers, HEADERS.committee)

  if (nameIndex === -1 || usernameIndex === -1) {
    throw new Error(`Keyholder tab "${tab}" needs at least "Nimi" and "Telegram" columns`)
  }

  const cell = (row: unknown[], index: number): string =>
    index === -1 ? '' : String(row[index] ?? '').trim()

  /**
   * A Telegram user id is always a plain positive integer. Anything else in the
   * column -- a placeholder like "??", a note, a stray space -- is treated as
   * not yet bound, so the row can still be claimed by username. Accepting it
   * verbatim would permanently lock that person out: no real press would ever
   * match the value, and the row would never be offered for binding again.
   */
  const telegramUserId = (row: unknown[]): string => {
    const value = cell(row, userIdIndex)

    return /^\d+$/.test(value) ? value : ''
  }

  const rows = values
    .slice(1)
    .map((row, offset) => ({
      rowNumber: offset + 2, // +1 for the header, +1 because sheets are 1-based
      name: cell(row, nameIndex),
      username: normalizeUsername(cell(row, usernameIndex)),
      telegramUserId: telegramUserId(row),
      isCommittee: isTruthy(cell(row, committeeIndex)),
    }))
    .filter((row) => row.name || row.username || row.telegramUserId)

  return {
    rows,
    userIdColumn: userIdIndex === -1 ? null : columnLetter(userIdIndex),
  }
}

export const readKeyholderSheet = async (): Promise<KeyholderSheet> => {
  const sheets = getSheetsClient()
  const tab = getTabName()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: tab,
  })

  return parseKeyholderSheet(response.data.values ?? [], tab)
}

/** Write a resolved Telegram user ID into the sheet, so it is only ever resolved once. */
export const writeTelegramUserId = async (args: {
  rowNumber: number
  column: string
  telegramUserId: string
}): Promise<void> => {
  const sheets = getSheetsClient()
  const tab = getTabName()

  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `${tab}!${args.column}${args.rowNumber}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[args.telegramUserId]] },
  })
}
