import { describe, it, expect, beforeAll } from 'vitest'

import { getGoogleAuth } from '@/utilities/google/auth'

const SHEETS = ['https://www.googleapis.com/auth/spreadsheets']
const CALENDAR = ['https://www.googleapis.com/auth/calendar']

/**
 * A JWT only carries the scopes it was minted with. Handing the same instance to
 * a caller that asked for different scopes fails with "Insufficient Permission",
 * which reads like a file-sharing problem and is very hard to trace back.
 */
describe('getGoogleAuth', () => {
  beforeAll(() => {
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON = JSON.stringify({
      client_email: 'probe@example.iam.gserviceaccount.com',
      private_key: '-----BEGIN PRIVATE KEY-----\nnot-a-real-key\n-----END PRIVATE KEY-----\n',
    })
  })

  it('gives each scope set its own credentials', () => {
    const sheets = getGoogleAuth(SHEETS)
    const calendar = getGoogleAuth(CALENDAR)

    expect(sheets).not.toBe(calendar)
    expect(sheets.scopes).toEqual(SHEETS)
    expect(calendar.scopes).toEqual(CALENDAR)
  })

  it('reuses the credentials for the same scopes', () => {
    expect(getGoogleAuth(SHEETS)).toBe(getGoogleAuth(SHEETS))
  })

  it('treats the same scopes in a different order as the same set', () => {
    const both = [...SHEETS, ...CALENDAR]

    expect(getGoogleAuth(both)).toBe(getGoogleAuth([...both].reverse()))
  })
})
