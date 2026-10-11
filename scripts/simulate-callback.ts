/**
 * Press an Accept/Decline/Reopen button without Telegram.
 *
 * Telegram only delivers button presses to a registered webhook, and a webhook
 * must be a public HTTPS URL. This posts the same callback_query payload
 * straight at the local endpoint instead, so the whole decision path can be
 * exercised locally: keyholder lookup, the Payload status claim, the sheet
 * patch and the Telegram message edit.
 *
 *   pnpm tsx scripts/simulate-callback.ts accept 12
 *   pnpm tsx scripts/simulate-callback.ts decline 12 --user 123456789
 *   pnpm tsx scripts/simulate-callback.ts reopen 12 --url http://localhost:3000
 *
 * With no --user it borrows the first keyholder who already has a Telegram ID in
 * the sheet. When nobody is bound yet, pass your own id with --user: the press
 * then arrives carrying the username too, which exercises the same
 * claim-on-first-use binding production relies on and writes the id back to the
 * sheet. Get your id from @userinfobot in Telegram.
 *
 * This is not a dry run. It writes to the real reservation sheet and edits the
 * real Telegram message, because those are the same credentials production
 * uses. Only answerCallbackQuery fails, since the callback id is made up.
 */
import 'dotenv/config'

import { readKeyholderSheet } from '../src/utilities/google/keyholders'

const DECISIONS = ['accept', 'decline', 'reopen']

const argValue = (name: string): string | undefined => {
  const index = process.argv.indexOf(`--${name}`)

  return index === -1 ? undefined : process.argv[index + 1]
}

interface SimulatedUser {
  id: string
  username?: string
  name: string
}

const resolveUser = async (): Promise<SimulatedUser> => {
  const givenId = argValue('user')
  const givenUsername = argValue('username')
  const sheet = await readKeyholderSheet()

  if (givenId) {
    if (!/^\d+$/.test(givenId)) {
      throw new Error(`--user must be a numeric Telegram id, got "${givenId}"`)
    }

    // Carry the username so an unbound row can still be matched and bound, the
    // same way a real first press does.
    const row =
      sheet.rows.find((r) => r.telegramUserId === givenId) ||
      (givenUsername
        ? sheet.rows.find((r) => r.username === givenUsername.replace(/^@/, '').toLowerCase())
        : undefined)

    return {
      id: givenId,
      username: givenUsername?.replace(/^@/, '') || row?.username,
      name: row?.name || '(not found in the sheet)',
    }
  }

  const bound = sheet.rows.find((row) => row.telegramUserId)

  if (bound) {
    return { id: bound.telegramUserId, username: bound.username, name: bound.name }
  }

  const claimable = sheet.rows.filter((row) => row.username).slice(0, 5)

  throw new Error(
    'No keyholder has a Telegram id yet, so there is nobody to press as.\n' +
      'Pass your own: --user <id> [--username <name>]\n' +
      'Find your id by messaging @userinfobot in Telegram.\n' +
      `Usernames in the sheet include: ${claimable.map((r) => '@' + r.username).join(', ')}`,
  )
}

const main = async (): Promise<void> => {
  const [decision, submissionId] = process.argv.slice(2)

  if (!DECISIONS.includes(decision) || !submissionId) {
    throw new Error(
      `Usage: pnpm tsx scripts/simulate-callback.ts <${DECISIONS.join('|')}> <submissionId> [--user <id>] [--url <base>]`,
    )
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()

  if (!secret) {
    throw new Error('TELEGRAM_WEBHOOK_SECRET is not set')
  }

  const baseUrl = argValue('url') || 'http://localhost:3000'
  const user = await resolveUser()

  console.log(
    `Pressing "${decision}" on submission ${submissionId} as ${user.name} ` +
      `(id ${user.id}${user.username ? `, @${user.username}` : ', no username'})`,
  )

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/telegram/webhook`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-telegram-bot-api-secret-token': secret,
    },
    body: JSON.stringify({
      // Shaped exactly like a real update, minus the fields the handler ignores.
      callback_query: {
        id: `simulated-${Date.now()}`,
        data: `${decision}:${submissionId}`,
        from: {
          id: Number(user.id),
          username: user.username,
          first_name: 'Simulated',
          last_name: 'Press',
        },
      },
    }),
  })

  const body = await response.text()

  console.log(`HTTP ${response.status} ${body}`)

  // The handler answers 200 to everything so Telegram stops retrying, so the
  // status says nothing about the outcome. The dev server log and the
  // submission's own fields are what tell you what happened.
  if (response.status === 200) {
    console.log('\nCheck: the submission status in the admin, the sheet row, and the dev log.')
    console.log('answerCallbackQuery will have failed — the callback id is invented.')
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
