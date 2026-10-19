import type { PayloadHandler } from 'payload'
import { sendTelegramMessageWithResult, isTelegramConfigured } from '@/utilities/telegram'
import {
  buildDecisionKeyboard,
  buildRequestMessage,
  formatDateFinnish,
  type AccessRequestBody,
} from '@/utilities/reservationMessage'
import { recordPendingReservation } from '@/utilities/reservationSheet'
import { findOverlappingRequests, parseRange } from '@/utilities/reservationOverlap'
import { syncAndRecordCalendar } from '@/utilities/reservationCalendar'
import { sendReservationEmail } from '@/utilities/reservationEmail'

export const accessRequestHandler: PayloadHandler = async (req) => {
  const { payload } = req

  // Only handle POST
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 })
  }

  try {
    const body = (await req.json?.()) as AccessRequestBody | undefined

    if (!body) {
      return Response.json({ error: 'Request body is required' }, { status: 400 })
    }

    // Validate required fields
    const requiredFields = [
      'targetId',
      'name',
      'email',
      'startDate',
      'endDate',
      'startTime',
      'endTime',
    ]
    const missingFields = requiredFields.filter((field) => !body[field as keyof AccessRequestBody])

    if (missingFields.length > 0) {
      return Response.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Look up the target
    const target = await payload.findByID({
      collection: 'reservation-targets',
      id: body.targetId,
    })

    if (!target) {
      return Response.json({ error: 'Invalid target' }, { status: 400 })
    }

    if (!target.active) {
      return Response.json(
        { error: 'This target is not currently accepting requests' },
        { status: 400 },
      )
    }

    const language = body.language || 'fi'

    // Check if Telegram is configured
    if (!isTelegramConfigured()) {
      payload.logger.error('Telegram not configured')
      return Response.json({ error: 'Notification system not configured' }, { status: 500 })
    }

    // Check if target has a topic ID
    if (!target.telegramTopicId) {
      payload.logger.error(`No Telegram topic ID configured for target: ${target.emailPrefix}`)
      return Response.json(
        { error: 'This target has no configured notification channel' },
        { status: 500 },
      )
    }

    // Advisory overlap check. A clash never refuses the request -- two groups
    // can legitimately want the same room at once -- but the requester confirms
    // it, and the keyholder deciding it sees a marker on the message.
    let overlapWarning = false
    const range = parseRange(body)

    if (range) {
      const conflicts = await findOverlappingRequests({
        payload,
        targetId: target.id,
        range,
      })

      if (conflicts.length > 0) {
        if (!body.confirmOverlap) {
          return Response.json(
            {
              overlap: true,
              conflicts: conflicts.map((conflict) => ({
                status: conflict.status,
                startDate: formatDateFinnish(conflict.start.toISOString().slice(0, 10)),
                startTime: conflict.start.toTimeString().slice(0, 5),
                endTime: conflict.end.toTimeString().slice(0, 5),
              })),
            },
            { status: 409 },
          )
        }

        overlapWarning = true
      }
    }

    // Build Telegram message
    const telegramMessage = buildRequestMessage(body, target, { overlapWarning })

    // Create submission record first
    const submission = await payload.create({
      collection: 'access-request-submissions',
      data: {
        target: target.id,
        submitterName: body.name,
        submitterEmail: body.email,
        requestData: body,
        notificationSentTo: `Telegram topic ${target.telegramTopicId}`,
        sentAt: new Date().toISOString(),
        emailStatus: 'pending',
        status: 'pending',
        overlapWarning,
        telegramTopicId: target.telegramTopicId,
        sheetSyncStatus: 'not-written',
      },
    })

    // Send message to Telegram
    try {
      const sent = await sendTelegramMessageWithResult({
        text: telegramMessage,
        topicId: target.telegramTopicId,
        replyMarkup: buildDecisionKeyboard(submission.id),
      })

      if (!sent.success) {
        throw new Error(sent.error || 'Failed to send Telegram message')
      }

      // Store the message ID so the webhook can edit this message on a decision
      await payload.update({
        collection: 'access-request-submissions',
        id: submission.id,
        data: {
          emailStatus: 'sent',
          telegramMessageId: sent.messageId ? String(sent.messageId) : undefined,
        },
      })

      // The pending booking shows in the calendar at once, marked unconfirmed.
      await syncAndRecordCalendar({ payload, submission, target })

      // The sheet is a mirror, so a failure here must not fail the request.
      // A decision later appends the row if it turns out to be missing.
      try {
        const { rowNumber } = await recordPendingReservation({ submission, target })

        await payload.update({
          collection: 'access-request-submissions',
          id: submission.id,
          data: { sheetSyncStatus: 'written', sheetRowNumber: rowNumber },
        })
      } catch (error) {
        const sheetError = error instanceof Error ? error.message : String(error)

        payload.logger.error(
          `Failed to write pending reservation ${submission.id} to the sheet: ${sheetError}`,
        )

        await payload.update({
          collection: 'access-request-submissions',
          id: submission.id,
          data: { sheetSyncStatus: 'failed', sheetError },
        })
      }

      // A confirmation the request arrived. A failure is recorded on the
      // submission but does not fail the request, which already reached Telegram.
      await sendReservationEmail({ payload, submission, target, type: 'received' })

      return Response.json({
        success: true,
        message:
          language === 'fi'
            ? 'Käyttöpyyntö lähetetty onnistuneesti'
            : 'Access request sent successfully',
      })
    } catch (sendError) {
      const errorMessage = sendError instanceof Error ? sendError.message : 'Unknown error'

      // Update submission with error
      await payload.update({
        collection: 'access-request-submissions',
        id: submission.id,
        data: {
          emailStatus: 'failed',
          errorMessage,
        },
      })

      payload.logger.error(`Failed to send Telegram message: ${errorMessage}`)

      return Response.json(
        {
          success: false,
          error:
            language === 'fi'
              ? 'Viestin lähetys epäonnistui. Yritä myöhemmin uudelleen.'
              : 'Failed to send message. Please try again later.',
        },
        { status: 500 },
      )
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    payload.logger.error(`Access request error: ${errorMessage}`)

    return Response.json({ error: 'An error occurred processing your request' }, { status: 500 })
  }
}

// Also export a GET handler for fetching active targets
export const reservationTargetsHandler: PayloadHandler = async (req) => {
  const { payload } = req

  try {
    const targets = await payload.find({
      collection: 'reservation-targets',
      where: {
        active: { equals: true },
      },
      sort: 'sortOrder',
      limit: 100,
    })

    return Response.json({
      targets: targets.docs,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    payload.logger.error(`Failed to fetch reservation targets: ${errorMessage}`)

    return Response.json({ error: 'Failed to fetch targets' }, { status: 500 })
  }
}

// GET handler for fetching calendar IDs from active reservation targets
export const reservationTargetCalendarsHandler: PayloadHandler = async (req) => {
  const { payload } = req

  try {
    const targets = await payload.find({
      collection: 'reservation-targets',
      where: {
        and: [{ active: { equals: true } }, { googleCalendarId: { exists: true } }],
      },
      sort: 'sortOrder',
      limit: 100,
    })

    // Filter out targets without calendar IDs and map to calendar data
    const calendars = targets.docs
      .filter((target) => target.googleCalendarId)
      .map((target) => ({
        googleCalendarId: target.googleCalendarId,
        calendarColor: target.calendarColor || '#3F51B5',
        labelFi: target.labelFi,
        labelEn: target.labelEn,
      }))

    return Response.json({
      calendars,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    payload.logger.error(`Failed to fetch reservation target calendars: ${errorMessage}`)

    return Response.json({ error: 'Failed to fetch calendars' }, { status: 500 })
  }
}
