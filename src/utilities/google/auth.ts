import { google } from 'googleapis'

/** googleapis re-exports the auth classes, so google-auth-library stays transitive. */
type JWT = InstanceType<typeof google.auth.JWT>

/**
 * Service account credentials for the Google APIs.
 *
 * GOOGLE_SERVICE_ACCOUNT_JSON accepts either raw JSON or base64-encoded JSON,
 * so the key can be pasted straight into an env file without newline escaping.
 */
const parseCredentials = (): Record<string, string> => {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim()

  if (!raw) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not set')
  }

  const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf-8')

  try {
    return JSON.parse(json) as Record<string, string>
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is neither valid JSON nor base64-encoded JSON')
  }
}

let cached: JWT | null = null

export const getGoogleAuth = (scopes: string[]): JWT => {
  if (cached) {
    return cached
  }

  const credentials = parseCredentials()

  cached = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes,
  })

  return cached
}

export const isGoogleConfigured = (): boolean =>
  Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim() && process.env.GOOGLE_SHEETS_ID?.trim())
