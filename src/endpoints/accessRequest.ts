import type { PayloadHandler } from 'payload'
import type { ReservationTarget } from '@/payload-types'
import { sendTelegramMessageWithResult, isTelegramConfigured } from '@/utilities/telegram'
import {
  buildDecisionKeyboard,
  buildRequestMessage,
  formatDateFinnish,
  type AccessRequestBody,
} from '@/utilities/reservationMessage'
import { recordPendingReservation } from '@/utilities/reservationSheet'

const _buildEmailContent = (
  data: AccessRequestBody,
  target: ReservationTarget,
  language: 'fi' | 'en',
): { subject: string; html: string; text: string } => {
  const targetLabel = language === 'fi' ? target.labelFi : target.labelEn

  const subject =
    language === 'fi' ? `Käyttöpyyntö: ${targetLabel}` : `Access Request: ${targetLabel}`

  const labels =
    language === 'fi'
      ? {
          title: 'Käyttöpyyntö',
          target: 'Kohde',
          name: 'Nimi',
          email: 'Sähköposti',
          phone: 'Puhelin',
          telegram: 'Telegram',
          address: 'Osoite',
          association: 'Yhdistys',
          associationName: 'Yhdistyksen nimi',
          startDate: 'Alkupäivä',
          endDate: 'Loppupäivä',
          startTime: 'Alkuaika',
          endTime: 'Loppuaika',
          participants: 'Osallistujat',
          useType: 'Käyttötarkoitus',
          details: 'Lisätiedot',
          isPublicEvent: 'Yleinen tilaisuus',
          publicEventName: 'Tapahtuman nimi',
          associationYes: 'Kyllä, yhdistyksen puolesta',
          associationNo: 'Ei, henkilökohtainen varaus',
          isPublicEventYes: 'Kyllä',
          isPublicEventNo: 'Ei',
        }
      : {
          title: 'Access Request',
          target: 'Target',
          name: 'Name',
          email: 'Email',
          phone: 'Phone',
          telegram: 'Telegram',
          address: 'Address',
          association: 'Association',
          associationName: 'Association name',
          startDate: 'Start Date',
          endDate: 'End Date',
          startTime: 'Start Time',
          endTime: 'End Time',
          participants: 'Participants',
          useType: 'Use Type',
          details: 'Additional Details',
          isPublicEvent: 'Open event',
          publicEventName: 'Event name',
          associationYes: 'Yes, on behalf of an association',
          associationNo: 'No, individual booking',
          isPublicEventYes: 'Yes',
          isPublicEventNo: 'No',
        }

  const associationValue =
    data.association === 'yes'
      ? `${labels.associationYes}${data.associationName ? ` — ${data.associationName}` : ''}`
      : data.association === 'no'
        ? labels.associationNo
        : undefined

  const publicEventValue =
    data.isPublicEvent === 'yes'
      ? `${labels.isPublicEventYes}${data.publicEventName ? ` — ${data.publicEventName}` : ''}`
      : data.isPublicEvent === 'no'
        ? labels.isPublicEventNo
        : undefined

  const rows = [
    { label: labels.target, value: targetLabel },
    { label: labels.name, value: data.name },
    { label: labels.email, value: data.email },
    { label: labels.phone, value: data.phone },
    { label: labels.telegram, value: data.telegram },
    { label: labels.address, value: data.address },
    { label: labels.association, value: associationValue },
    { label: labels.startDate, value: formatDateFinnish(data.startDate) },
    { label: labels.endDate, value: formatDateFinnish(data.endDate) },
    { label: labels.startTime, value: data.startTime },
    { label: labels.endTime, value: data.endTime },
    { label: labels.participants, value: data.participants?.toString() },
    { label: labels.useType, value: data.useType },
    { label: labels.details, value: data.details },
    { label: labels.isPublicEvent, value: publicEventValue },
  ].filter((row) => row.value)

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    h1 { color: #2563eb; }
    table { border-collapse: collapse; width: 100%; max-width: 600px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background-color: #f3f4f6; width: 30%; }
  </style>
</head>
<body>
  <h1>${labels.title}: ${targetLabel}</h1>
  <table>
    ${rows.map((row) => `<tr><th>${row.label}</th><td>${row.value}</td></tr>`).join('\n    ')}
  </table>
</body>
</html>
  `.trim()

  const text = `${labels.title}: ${targetLabel}\n\n${rows.map((row) => `${row.label}: ${row.value}`).join('\n')}`

  return { subject, html, text }
}

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

    // Build Telegram message
    const telegramMessage = buildRequestMessage(body, target)

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
