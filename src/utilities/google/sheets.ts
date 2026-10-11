import { google } from 'googleapis'

import { getGoogleAuth } from './auth'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

const getSheetsClient = () => google.sheets({ version: 'v4', auth: getGoogleAuth(SCOPES) })

const getSpreadsheetId = (): string => {
  const id = process.env.GOOGLE_SHEETS_ID?.trim()

  if (!id) {
    throw new Error('GOOGLE_SHEETS_ID is not set')
  }

  return id
}

let cachedTabName: string | null = null

/**
 * The tab holding the reservations. GOOGLE_SHEETS_TAB wins; otherwise the
 * first tab is used, which is also the one the Apps Script scans through
 * getActiveSheet().
 */
const getTabName = async (): Promise<string> => {
  const configured = process.env.GOOGLE_SHEETS_TAB?.trim()

  if (configured) {
    return configured
  }

  if (cachedTabName) {
    return cachedTabName
  }

  const sheets = getSheetsClient()
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: getSpreadsheetId(),
    fields: 'sheets.properties.title',
  })

  const title = spreadsheet.data.sheets?.[0]?.properties?.title

  if (!title) {
    throw new Error('Could not resolve a tab name from the spreadsheet')
  }

  cachedTabName = title

  return title
}

/** Pull the 1-based row number out of an A1 range like "Varaukset!A42:M42". */
const parseAppendedRowNumber = (updatedRange: string | null | undefined): number | undefined => {
  const match = updatedRange?.match(/![A-Z]+(\d+)/)

  return match ? parseInt(match[1], 10) : undefined
}

export interface AppendResult {
  rowNumber?: number
}

/**
 * Append one row to the reservation sheet.
 *
 * USER_ENTERED lets Sheets parse the datetime strings into real date values the
 * way a form submission would. The calendar ID columns are deliberately left
 * empty: the Apps Script treats an empty one as "not yet processed".
 */
export const appendRow = async (values: string[]): Promise<AppendResult> => {
  const sheets = getSheetsClient()
  const tab = await getTabName()

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${tab}!A:M`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [values],
    },
  })

  return { rowNumber: parseAppendedRowNumber(response.data.updates?.updatedRange) }
}

/** One cell, as a trimmed string. Empty when the cell is blank. */
export const readCell = async (range: string): Promise<string> => {
  const sheets = getSheetsClient()
  const tab = await getTabName()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${tab}!${range}`,
  })

  return String(response.data.values?.[0]?.[0] ?? '').trim()
}

/** A whole column top to bottom, index 0 being row 1. */
export const readColumn = async (column: string): Promise<string[]> => {
  const sheets = getSheetsClient()
  const tab = await getTabName()

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${tab}!${column}:${column}`,
  })

  return (response.data.values ?? []).map((row) => String(row?.[0] ?? '').trim())
}

export interface RangeUpdate {
  /** A1 notation without the tab, e.g. "B12" or "I12:J12". */
  range: string
  values: string[]
}

/**
 * Patch specific cells of an existing row. Several ranges go in one request so
 * a status change and the approver land together rather than as two states a
 * reader could catch in between.
 */
export const updateRanges = async (updates: RangeUpdate[]): Promise<void> => {
  if (updates.length === 0) {
    return
  }

  const sheets = getSheetsClient()
  const tab = await getTabName()

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: updates.map((update) => ({
        range: `${tab}!${update.range}`,
        values: [update.values],
      })),
    },
  })
}
