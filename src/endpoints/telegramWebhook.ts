import type { PayloadHandler } from 'payload'
import type { AccessRequestSubmission, ReservationTarget } from '@/payload-types'

import { answerCallbackQuery, editTelegramMessage } from '@/utilities/telegram'
import {
  buildDecidedMessage,
  buildDecisionKeyboard,
  buildReopenKeyboard,
  buildRequestMessage,
  type AccessRequestBody,
} from '@/utilities/reservationMessage'
import { recordDecision, SHEET_STATUS } from '@/utilities/reservationSheet'
import { syncAndRecordCalendar } from '@/utilities/reservationCalendar'
import { sendReservationEmail } from '@/utilities/reservationEmail'
import { RegistryUnavailableError, resolveActor } from '@/utilities/keyholderRegistry'

interface TelegramCallbackQuery {
  id: string
  data?: string
  from: {
    id: number
    username?: string
    first_name?: string
    last_name?: string
  }
  message?: {
    message_id: number
  }
}

interface TelegramUpdate {
  callback_query?: TelegramCallbackQuery
}

type Decision = 'accept' | 'decline' | 'reopen'

/** Telegram retries on any non-2xx, so the handler always returns 200. */
const ok = (): Response => Response.json({ ok: true })

const parseCallbackData = (
  data: string | undefined,
): { decision: Decision; submissionId: number } | null => {
  const match = data?.match(/^(accept|decline|reopen):(\d+)$/)

  if (!match) {
    return null
  }

  return { decision: match[1] as Decision, submissionId: parseInt(match[2], 10) }
}

const telegramDisplayName = (from: TelegramCallbackQuery['from']): string => {
  const name = [from.first_name, from.last_name].filter(Boolean).join(' ')

  return name || from.username || String(from.id)
}

export const telegramWebhookHandler: PayloadHandler = async (req) => {
  const { payload } = req

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  // Telegram echoes the secret set via setWebhook. Without it, anyone who
  // learns the URL could decide reservations.
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim()

  if (!expectedSecret) {
    payload.logger.error('TELEGRAM_WEBHOOK_SECRET is not set; refusing webhook')
    return Response.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  if (req.headers.get('x-telegram-bot-api-secret-token') !== expectedSecret) {
    payload.logger.warn('Telegram webhook called with a bad secret token')
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }

  const update = (await req.json?.()) as TelegramUpdate | undefined
  const query = update?.callback_query

  // Anything that is not a button press (plain messages, edits) is ignored.
  if (!query) {
    return ok()
  }

  const parsed = parseCallbackData(query.data)

  if (!parsed) {
    await answerCallbackQuery({ callbackQueryId: query.id })
    return ok()
  }

  const { decision, submissionId } = parsed
  const actorId = String(query.from.id)
  const actorName = telegramDisplayName(query.from)

  try {
    const submission = (await payload.findByID({
      collection: 'access-request-submissions',
      id: submissionId,
      depth: 1,
    })) as AccessRequestSubmission

    const target = submission.target as ReservationTarget

    if (!target || typeof target !== 'object') {
      await answerCallbackQuery({
        callbackQueryId: query.id,
        text: 'Target not found',
        showAlert: true,
      })
      return ok()
    }

    let actor
    try {
      actor = await resolveActor({
        payload,
        telegramUserId: actorId,
        username: query.from.username,
        displayName: actorName,
      })
    } catch (error) {
      if (error instanceof RegistryUnavailableError) {
        await answerCallbackQuery({
          callbackQueryId: query.id,
          text: 'Cannot reach the keyholder list right now. Try again in a moment.',
          showAlert: true,
        })
        return ok()
      }

      throw error
    }

    const isCommittee = actor.found && actor.isCommittee
    const isKeyholder = actor.found

    if (decision === 'reopen') {
      // Both outcomes are reversible. Putting the row back to "Odottaa" is
      // enough to undo an accept as well: the calendar is reconciled from the
      // status, so the unconfirmed marking returns and the public event comes
      // down.
      if (submission.status !== 'declined' && submission.status !== 'accepted') {
        await answerCallbackQuery({
          callbackQueryId: query.id,
          text: 'This request is already open',
          showAlert: true,
        })
        return ok()
      }

      if (!isCommittee) {
        payload.logger.warn(
          `Refused reopen of ${submissionId} by ${actorName} (${actorId}): not on the committee`,
        )

        await answerCallbackQuery({
          callbackQueryId: query.id,
          text: `Only the committee can reopen a request. Your Telegram ID: ${actorId}`,
          showAlert: true,
        })
        return ok()
      }

      await payload.update({
        collection: 'access-request-submissions',
        id: submissionId,
        data: {
          status: 'pending',
          decidedBy: null,
          decidedByTelegramId: null,
          decidedByEmail: null,
          decidedByTelegram: null,
          decidedAt: null,
          declineReason: null,
        },
      })

      if (submission.telegramMessageId) {
        const edited = await editTelegramMessage({
          messageId: submission.telegramMessageId,
          text: buildRequestMessage((submission.requestData ?? {}) as AccessRequestBody, target, {
            overlapWarning: submission.overlapWarning,
          }),
          replyMarkup: buildDecisionKeyboard(submissionId),
        })

        if (!edited.success) {
          payload.logger.error(`Failed to edit Telegram message: ${edited.error}`)
        }
      }

      // Back to unconfirmed in the calendar, and the public entry comes down.
      await syncAndRecordCalendar({
        payload,
        submission: { ...submission, status: 'pending', decidedBy: null },
        target,
      })

      try {
        await recordDecision({
          submission,
          target,
          status: SHEET_STATUS.pending,
          decidedByName: null,
          decidedAt: null,
        })
      } catch (error) {
        // The reopen still stands; only the mirror is stale.
        payload.logger.error(
          `Failed to reopen reservation ${submissionId} in the sheet: ${
            error instanceof Error ? error.message : String(error)
          }`,
        )
      }

      await answerCallbackQuery({ callbackQueryId: query.id, text: 'Reopened' })

      return ok()
    }

    // Already decided: say who did it rather than deciding twice.
    if (submission.status && submission.status !== 'pending') {
      const already = submission.status === 'accepted' ? 'accepted' : 'declined'

      await answerCallbackQuery({
        callbackQueryId: query.id,
        text: `${submission.decidedBy || 'Someone'} has already ${already} this request`,
        showAlert: true,
      })
      return ok()
    }

    if (decision === 'accept' && !isCommittee && !isKeyholder) {
      // Logged because the toast is the only other trace. Without this a press
      // refused for an unrecognised id looks identical to nothing happening.
      payload.logger.warn(
        `Refused accept of ${submissionId} by ${actorName} (${actorId}): not a keyholder`,
      )

      await answerCallbackQuery({
        callbackQueryId: query.id,
        text: `You are not on the keyholder list. Ask the committee to add you — your Telegram ID is ${actorId}.`,
        showAlert: true,
      })
      return ok()
    }

    if (decision === 'decline' && !isCommittee) {
      payload.logger.warn(
        `Refused decline of ${submissionId} by ${actorName} (${actorId}): not on the committee`,
      )

      await answerCallbackQuery({
        callbackQueryId: query.id,
        text: `Only the committee can decline. Your Telegram ID: ${actorId}`,
        showAlert: true,
      })
      return ok()
    }

    // The registry name is what reaches the sheet, so it is a real name rather
    // than a Telegram display name.
    const decidedBy = actor.name
    const decidedAt = new Date()

    // Claim the decision before touching the sheet. A second press then sees a
    // non-pending status and stops, so a retry cannot append the row twice. If
    // the sheet write fails afterwards it shows up as sheetSyncStatus: failed
    // rather than as a lost decision.
    await payload.update({
      collection: 'access-request-submissions',
      id: submissionId,
      data: {
        status: decision === 'accept' ? 'accepted' : 'declined',
        decidedBy,
        decidedByTelegramId: actorId,
        decidedByEmail: actor.email || null,
        decidedByTelegram: actor.username || null,
        decidedAt: decidedAt.toISOString(),
      },
    })

    // The calendar follows the decision in this same request rather than on a
    // five-minute poll, so an approval is visible as soon as it is made.
    const calendar = await syncAndRecordCalendar({
      payload,
      submission: {
        ...submission,
        status: decision === 'accept' ? 'accepted' : 'declined',
        decidedBy,
      },
      target,
    })

    let sheetError: string | undefined

    // Both outcomes reach the sheet, which is a mirror only -- the calendar was
    // already reconciled above.
    try {
      const { rowNumber } = await recordDecision({
        submission,
        target,
        status: decision === 'accept' ? SHEET_STATUS.accepted : SHEET_STATUS.declined,
        decidedByName: decidedBy,
        decidedAt,
      })

      await payload.update({
        collection: 'access-request-submissions',
        id: submissionId,
        data: { sheetSyncStatus: 'written', sheetRowNumber: rowNumber },
      })
    } catch (error) {
      // The decision still stands; the reservation is flagged for manual entry.
      sheetError = error instanceof Error ? error.message : String(error)
      payload.logger.error(
        `Failed to write decision for reservation ${submissionId} to the sheet: ${sheetError}`,
      )

      await payload.update({
        collection: 'access-request-submissions',
        id: submissionId,
        data: { sheetSyncStatus: 'failed', sheetError },
      })
    }

    // Whoever decided becomes the requester's contact for the reservation,
    // for a decline as much as for an accept.
    const email = await sendReservationEmail({
      payload,
      submission,
      target,
      type: decision === 'accept' ? 'accepted' : 'declined',
      decider: { name: decidedBy, email: actor.email, telegram: actor.username },
    })

    if (submission.telegramMessageId) {
      const body = buildRequestMessage(
        (submission.requestData ?? {}) as AccessRequestBody,
        target,
        { overlapWarning: submission.overlapWarning },
      )

      const edited = await editTelegramMessage({
        messageId: submission.telegramMessageId,
        text: buildDecidedMessage({
          body,
          status: decision === 'accept' ? 'accepted' : 'declined',
          decidedBy,
          decidedAt,
          sheetFailed: Boolean(sheetError),
          calendarFailed: !calendar.ok,
          emailFailed: !email.ok,
        }),
        // Either outcome can be taken back by the committee, so both carry the
        // reopen button.
        replyMarkup: buildReopenKeyboard(submissionId),
      })

      if (!edited.success) {
        payload.logger.error(`Failed to edit Telegram message: ${edited.error}`)
      }
    }

    await answerCallbackQuery({
      callbackQueryId: query.id,
      text: [
        decision === 'accept' ? 'Accepted' : 'Declined',
        sheetError ? 'the reservation sheet was not updated' : null,
        calendar.ok ? null : 'the calendar was not updated',
        email.ok ? null : 'the requester was not emailed',
      ]
        .filter(Boolean)
        .join(' — '),
      showAlert: Boolean(sheetError) || !calendar.ok || !email.ok,
    })

    return ok()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    payload.logger.error(`Telegram webhook error: ${message}`)

    await answerCallbackQuery({
      callbackQueryId: query.id,
      text: 'Something went wrong',
      showAlert: true,
    })

    return ok()
  }
}
