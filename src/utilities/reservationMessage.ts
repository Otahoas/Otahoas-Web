import type { ReservationTarget } from '@/payload-types'

import type { InlineKeyboardMarkup } from './telegram'

export interface AccessRequestBody {
  targetId: string
  language: 'fi' | 'en'
  name: string
  email: string
  phone?: string
  telegram?: string
  address?: string
  association?: string
  associationName?: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  participants?: number
  useType?: string
  details?: string
  isPublicEvent?: string
  publicEventName?: string
  [key: string]: unknown
}

export const formatDateFinnish = (dateStr: string): string => {
  // Expects format YYYY-MM-DD or DD.MM.YYYY
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-')
    return `${day}.${month}.${year}`
  }
  return dateStr
}

const escapeHtml = (str: string | undefined): string => {
  if (!str) return ''
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * The request body of the Telegram message. Built from the submission rather
 * than read back from Telegram, so an edit can reproduce it exactly.
 */
export const buildRequestMessage = (data: AccessRequestBody, target: ReservationTarget): string => {
  const targetLabel = target.labelEn

  const lines = [
    `<b>Access Request: ${escapeHtml(targetLabel)}</b>`,
    '',
    `<b>Name:</b> ${escapeHtml(data.name)}`,
    `<b>Email:</b> ${escapeHtml(data.email)}`,
  ]

  if (data.phone) lines.push(`<b>Phone:</b> ${escapeHtml(data.phone)}`)
  if (data.telegram) lines.push(`<b>Telegram:</b> ${escapeHtml(data.telegram)}`)
  if (data.address) lines.push(`<b>Address:</b> ${escapeHtml(data.address)}`)

  if (data.association === 'yes') {
    lines.push(`<b>Association:</b> Yes — ${escapeHtml(data.associationName)}`)
  } else if (data.association === 'no') {
    lines.push(`<b>Association:</b> No (individual booking)`)
  }

  lines.push('')
  lines.push(`<b>Start Date:</b> ${formatDateFinnish(data.startDate)}`)
  lines.push(`<b>End Date:</b> ${formatDateFinnish(data.endDate)}`)
  lines.push(`<b>Start Time:</b> ${escapeHtml(data.startTime)}`)
  lines.push(`<b>End Time:</b> ${escapeHtml(data.endTime)}`)

  if (data.participants) lines.push(`<b>Participants:</b> ${data.participants}`)
  if (data.useType) lines.push(`<b>Purpose:</b> ${escapeHtml(data.useType)}`)

  if (data.details) {
    lines.push('')
    lines.push(`<b>Additional Details:</b>`)
    lines.push(escapeHtml(data.details))
  }

  if (data.isPublicEvent === 'yes') {
    lines.push('')
    lines.push(`<b>Open Event:</b> Yes — ${escapeHtml(data.publicEventName)}`)
  } else if (data.isPublicEvent === 'no') {
    lines.push(`<b>Open Event:</b> No`)
  }

  return lines.join('\n')
}

/** Callback data stays well inside Telegram's 64-byte limit: "accept:123". */
export const buildDecisionKeyboard = (submissionId: number | string): InlineKeyboardMarkup => ({
  inline_keyboard: [
    [
      { text: '✅ Accept', callback_data: `accept:${submissionId}` },
      { text: '❌ Decline', callback_data: `decline:${submissionId}` },
    ],
  ],
})

/** Shown on a decided request so the committee can undo a mis-click. */
export const buildReopenKeyboard = (submissionId: number | string): InlineKeyboardMarkup => ({
  inline_keyboard: [[{ text: '↩️ Reopen', callback_data: `reopen:${submissionId}` }]],
})

const formatDecidedAt = (date: Date): string => {
  const pad = (value: number): string => String(value).padStart(2, '0')

  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Prefix the request body with the decision, keeping the details readable. */
export const buildDecidedMessage = (args: {
  body: string
  status: 'accepted' | 'declined'
  decidedBy: string
  decidedAt: Date
  declineReason?: string
  sheetFailed?: boolean
}): string => {
  const { body, status, decidedBy, decidedAt, declineReason, sheetFailed } = args

  const header =
    status === 'accepted'
      ? `✅ <b>Accepted</b> — ${escapeHtml(decidedBy)}, ${formatDecidedAt(decidedAt)}`
      : `❌ <b>Declined</b> — ${escapeHtml(decidedBy)}, ${formatDecidedAt(decidedAt)}`

  const lines = [header]

  if (status === 'accepted' && sheetFailed) {
    lines.push('⚠️ <i>Could not write this to the reservation sheet — please add it by hand.</i>')
  }

  if (status === 'declined' && declineReason) {
    lines.push(`<b>Reason:</b> ${escapeHtml(declineReason)}`)
  }

  lines.push('')
  lines.push(body)

  return lines.join('\n')
}
