/**
 * Point the Telegram bot at this deployment's webhook, or report its state.
 *
 *   pnpm tsx scripts/set-telegram-webhook.ts            set it
 *   pnpm tsx scripts/set-telegram-webhook.ts --status   just look
 *
 * Run once per environment, and again whenever the URL, the secret or the bot
 * token changes. The registration lives on Telegram's side, not in this
 * container, so it survives redeploys.
 *
 * A bot token can only have ONE update consumer. Setting a webhook disables
 * getUpdates polling for that token, so nothing else may poll it.
 */
import 'dotenv/config'

const api = async (
  token: string,
  method: string,
  body?: unknown,
): Promise<Record<string, unknown>> => {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  })

  const data = (await response.json()) as {
    ok: boolean
    description?: string
    result?: Record<string, unknown>
  }

  if (!data.ok) {
    throw new Error(`${method} failed: ${data.description}`)
  }

  return data.result ?? {}
}

const requireToken = (): string => {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim()

  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN must be set')
  }

  return token
}

/**
 * What Telegram itself thinks. `last_error_message` is the one field worth
 * having: it says why deliveries are failing -- a TLS problem, a 403 from a
 * mismatched secret, or an endpoint that never answers -- instead of leaving
 * "the buttons do nothing" to guesswork.
 */
const showStatus = async (): Promise<void> => {
  const info = await api(requireToken(), 'getWebhookInfo')

  const url = String(info.url ?? '')

  console.log(`url:                  ${url || '(none -- the buttons do nothing)'}`)
  console.log(`pending updates:      ${info.pending_update_count ?? 0}`)
  console.log(`custom certificate:   ${info.has_custom_certificate ? 'yes' : 'no'}`)

  if (info.allowed_updates) {
    console.log(`allowed updates:      ${(info.allowed_updates as string[]).join(', ')}`)
  }

  if (info.ip_address) {
    console.log(`resolved ip:          ${info.ip_address}`)
  }

  if (info.last_error_message) {
    const when = info.last_error_date
      ? new Date(Number(info.last_error_date) * 1000).toISOString()
      : 'unknown time'

    console.log(`LAST ERROR:           ${info.last_error_message} (${when})`)
  } else if (url) {
    console.log('last error:           none')
  }

  const expected = (process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL)?.trim()

  if (expected) {
    const wanted = `${expected.replace(/\/$/, '')}/api/telegram/webhook`

    if (url && url !== wanted) {
      console.log(`\nMISMATCH: this environment expects ${wanted}`)
      console.log(
        'Another deployment owns the button presses. Re-run without --status to take over.',
      )
    }
  }
}

const setWebhook = async (): Promise<void> => {
  const token = requireToken()
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()
  const baseUrl = (process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL)?.trim()

  if (!secret || !baseUrl) {
    throw new Error(
      'TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET and NEXT_PUBLIC_SERVER_URL must all be set',
    )
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/telegram/webhook`

  await api(token, 'setWebhook', {
    url,
    secret_token: secret,
    // Only button presses. Plain messages and edits are not handled, so there
    // is no reason to receive them.
    allowed_updates: ['callback_query'],
    // Anything queued belongs to whatever was registered before. Replaying it
    // against this deployment would decide old requests.
    drop_pending_updates: true,
  })

  console.log(`Webhook set to ${url}`)
}

const main = async (): Promise<void> => {
  if (process.argv.includes('--status')) {
    await showStatus()
    return
  }

  await setWebhook()
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
