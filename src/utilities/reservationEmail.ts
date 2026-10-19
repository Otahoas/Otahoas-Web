import type { Payload } from 'payload'
import type { AccessRequestSubmission, ReservationTarget } from '@/payload-types'

import { formatDateFinnish, type AccessRequestBody } from './reservationMessage'

/**
 * Emails to the person who made a reservation request.
 *
 * The wording can be edited in the Reservation Emails global; everything else
 * -- when they go out, the reservation details and the contact block -- is
 * decided here, so an edit in the admin panel cannot drop the details a
 * requester needs.
 */

export type ReservationEmailType = 'received' | 'accepted' | 'declined'

type Language = 'fi' | 'en'

export interface Decider {
  name: string
  email?: string | null
  /** Telegram username, with or without the leading @. */
  telegram?: string | null
}

export interface EmailTemplate {
  subject?: string | null
  intro?: string | null
}

export const DEFAULT_REPLY_TO = 'otahoas@otahoas.fi'

type DefaultTemplate = { subject: string; intro: string }

export const DEFAULT_TEMPLATES: Record<Language, Record<ReservationEmailType, DefaultTemplate>> = {
  fi: {
    received: {
      subject: 'Varauspyyntö vastaanotettu: {space}',
      intro:
        'Hei {name},\n\nkiitos varauspyynnöstäsi. Avaimellinen käsittelee sen, ja saat sähköpostia, kun pyyntö on hyväksytty tai hylätty.',
    },
    accepted: {
      subject: 'Varaus hyväksytty: {space}',
      intro:
        'Hei {name},\n\nvarauksesi on hyväksytty. Sovi tilan avaamisesta alla olevan yhteyshenkilön kanssa.',
    },
    declined: {
      subject: 'Varausta ei hyväksytty: {space}',
      intro:
        'Hei {name},\n\nvarauspyyntöäsi ei valitettavasti voitu hyväksyä. Lisätietoja saat alla olevalta yhteyshenkilöltä.',
    },
  },
  en: {
    received: {
      subject: 'Reservation request received: {space}',
      intro:
        'Hi {name},\n\nthank you for your reservation request. A keyholder will handle it, and you will get an email once it has been accepted or declined.',
    },
    accepted: {
      subject: 'Reservation accepted: {space}',
      intro:
        'Hi {name},\n\nyour reservation has been accepted. Please arrange the opening of the space with the contact person below.',
    },
    declined: {
      subject: 'Reservation declined: {space}',
      intro:
        'Hi {name},\n\nunfortunately your reservation request could not be accepted. The contact person below can tell you more.',
    },
  },
}

/** Closes every email, so the requester always knows who is behind the bookings. */
export const DEFAULT_SIGNATURES: Record<Language, string> = {
  fi: 'Terveisin\nOtaHoas – Otaniemen asukastoimikunta\nHallinnoimme kerhohuoneita ja muita asukkaiden yhteisiä tiloja.\n\nSähköposti: otahoas@otahoas.fi\nhttps://otahoas.fi',
  en: "Best regards\nOtaHoas – the residents' committee of Otaniemi\nWe manage the club rooms and other shared spaces for residents.\n\nEmail: otahoas@otahoas.fi\nhttps://otahoas.fi",
}

/**
 * A reply should reach whoever can act on it: the contact person once someone
 * has decided, the committee before that or when the contact has no email.
 */
export const pickReplyTo = (
  type: ReservationEmailType,
  decider: Decider | undefined,
  fallback: string,
): string => (type !== 'received' && decider?.email?.trim()) || fallback

const LABELS = {
  fi: {
    detailsHeading: 'Varauksen tiedot',
    contact: 'Yhteyshenkilö',
    reason: 'Syy',
    target: 'Tila',
    name: 'Nimi',
    email: 'Sähköposti',
    phone: 'Puhelin',
    telegram: 'Telegram',
    address: 'Osoite',
    association: 'Yhdistys',
    start: 'Alkaa',
    end: 'Päättyy',
    participants: 'Osallistujat',
    useType: 'Käyttötarkoitus',
    details: 'Lisätiedot',
    isPublicEvent: 'Avoin tapahtuma',
    yes: 'Kyllä',
    no: 'Ei',
    associationNo: 'Ei, henkilökohtainen varaus',
    replyToContact: 'Vastaamalla tähän viestiin tavoitat yhteyshenkilön.',
    replyToCommittee: 'Vastaamalla tähän viestiin tavoitat asukastoimikunnan.',
  },
  en: {
    detailsHeading: 'Reservation details',
    contact: 'Contact person',
    reason: 'Reason',
    target: 'Space',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    telegram: 'Telegram',
    address: 'Address',
    association: 'Association',
    start: 'Starts',
    end: 'Ends',
    participants: 'Participants',
    useType: 'Purpose',
    details: 'Additional details',
    isPublicEvent: 'Open event',
    yes: 'Yes',
    no: 'No',
    associationNo: 'No, individual booking',
    replyToContact: 'Replying to this email reaches the contact person.',
    replyToCommittee: "Replying to this email reaches the residents' committee.",
  },
} as const

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/** Unknown placeholders are left as they are, so a typo is visible rather than silently empty. */
export const fillPlaceholders = (template: string, values: Record<string, string>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match)

/** Runs on already-escaped text, so the addresses it wraps cannot carry markup. */
const linkify = (escaped: string): string =>
  escaped.replace(
    /(https?:\/\/[^\s<]+)|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g,
    (match, url?: string, mail?: string) =>
      url ? `<a href="${url}">${url}</a>` : `<a href="mailto:${mail}">${mail}</a>`,
  )

const paragraphsToHtml = (text: string, options: { links?: boolean } = {}): string =>
  text
    .split(/\n{2,}/)
    .map((paragraph) => {
      const escaped = escapeHtml(paragraph)
      const html = options.links ? linkify(escaped) : escaped

      return `<p>${html.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')

const telegramHandle = (value: string | null | undefined): string =>
  (value ?? '').trim().replace(/^@/, '')

export const buildReservationEmail = (args: {
  type: ReservationEmailType
  data: AccessRequestBody
  target: ReservationTarget
  template?: EmailTemplate
  decider?: Decider
  declineReason?: string | null
  /** Edited closing text; empty uses the default. */
  signature?: string | null
}): { subject: string; html: string; text: string } => {
  const { type, data, target, decider, declineReason } = args
  const language: Language = data.language === 'en' ? 'en' : 'fi'
  const labels = LABELS[language]
  const defaults = DEFAULT_TEMPLATES[language][type]

  const space = language === 'fi' ? target.labelFi : target.labelEn
  const start = `${formatDateFinnish(data.startDate)} ${data.startTime}`
  const end = `${formatDateFinnish(data.endDate)} ${data.endTime}`

  const values: Record<string, string> = {
    name: data.name,
    space,
    start,
    end,
    decidedBy: decider?.name ?? '',
  }

  // A header cannot span lines; a pasted newline would otherwise break it.
  const subject = fillPlaceholders(args.template?.subject?.trim() || defaults.subject, values)
    .replace(/\s+/g, ' ')
    .trim()
  const intro = fillPlaceholders(args.template?.intro?.trim() || defaults.intro, values)

  const yesNo = (value: string | undefined, name?: string): string | undefined =>
    value === 'yes'
      ? `${labels.yes}${name ? ` — ${name}` : ''}`
      : value === 'no'
        ? labels.no
        : undefined

  const detailRows: { label: string; value: string | undefined }[] = [
    { label: labels.target, value: space },
    { label: labels.start, value: start },
    { label: labels.end, value: end },
    { label: labels.name, value: data.name },
    { label: labels.email, value: data.email },
    { label: labels.phone, value: data.phone },
    { label: labels.telegram, value: data.telegram },
    { label: labels.address, value: data.address },
    {
      label: labels.association,
      value:
        data.association === 'no'
          ? labels.associationNo
          : yesNo(data.association, data.associationName),
    },
    { label: labels.participants, value: data.participants?.toString() },
    { label: labels.useType, value: data.useType },
    { label: labels.details, value: data.details },
    { label: labels.isPublicEvent, value: yesNo(data.isPublicEvent, data.publicEventName) },
  ]
  const details = detailRows.filter((row): row is { label: string; value: string } =>
    Boolean(row.value),
  )

  const handle = telegramHandle(decider?.telegram)
  const contact =
    type !== 'received' && decider
      ? {
          name: decider.name,
          telegram: handle ? `@${handle}` : '',
          telegramUrl: handle ? `https://t.me/${encodeURIComponent(handle)}` : '',
          email: decider.email?.trim() ?? '',
        }
      : null

  const reason = type === 'declined' ? declineReason?.trim() : undefined
  // Matches pickReplyTo: replies reach the contact only when they have an email.
  const replyNote = contact?.email ? labels.replyToContact : labels.replyToCommittee
  const signature = args.signature?.trim() || DEFAULT_SIGNATURES[language]

  const cell = 'padding:6px 12px 6px 0;vertical-align:top;'
  const tableRows = (rows: { label: string; value: string }[]): string =>
    rows
      .map(
        (row) =>
          `<tr><th style="${cell}text-align:left;font-weight:600;white-space:nowrap;">${escapeHtml(row.label)}</th><td style="${cell}">${escapeHtml(row.value).replace(/\n/g, '<br>')}</td></tr>`,
      )
      .join('\n')

  const htmlParts = [paragraphsToHtml(intro)]

  if (reason) {
    htmlParts.push(`<p><strong>${labels.reason}:</strong> ${escapeHtml(reason)}</p>`)
  }

  if (contact) {
    const lines = [`<strong>${escapeHtml(contact.name)}</strong>`]

    if (contact.telegram) {
      lines.push(
        `${labels.telegram}: <a href="${escapeHtml(contact.telegramUrl)}">${escapeHtml(contact.telegram)}</a>`,
      )
    }

    if (contact.email) {
      lines.push(
        `${labels.email}: <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>`,
      )
    }

    htmlParts.push(`<h2 style="font-size:16px;margin:24px 0 8px;">${labels.contact}</h2>`)
    htmlParts.push(`<p>${lines.join('<br>')}</p>`)
  }

  htmlParts.push(`<h2 style="font-size:16px;margin:24px 0 8px;">${labels.detailsHeading}</h2>`)
  htmlParts.push(`<table style="border-collapse:collapse;">\n${tableRows(details)}\n</table>`)
  htmlParts.push(
    `<p style="color:#666;font-size:13px;margin-top:24px;">${escapeHtml(replyNote)}</p>`,
  )
  htmlParts.push(
    `<div style="border-top:1px solid #ddd;margin-top:16px;padding-top:8px;color:#444;font-size:13px;">\n${paragraphsToHtml(signature, { links: true })}\n</div>`,
  )

  const html = `<!DOCTYPE html>
<html lang="${language}">
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#222;max-width:600px;">
${htmlParts.join('\n')}
</body>
</html>`

  const textParts = [intro]

  if (reason) {
    textParts.push(`${labels.reason}: ${reason}`)
  }

  if (contact) {
    textParts.push(
      [
        `${labels.contact}:`,
        contact.name,
        contact.telegram ? `${labels.telegram}: ${contact.telegram} (${contact.telegramUrl})` : '',
        contact.email ? `${labels.email}: ${contact.email}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }

  textParts.push(
    [`${labels.detailsHeading}:`, ...details.map((row) => `${row.label}: ${row.value}`)].join('\n'),
  )
  textParts.push(replyNote)
  textParts.push(`--\n${signature}`)

  return { subject, html, text: textParts.join('\n\n') }
}

type RequesterEmailStatus = 'sent' | 'failed' | 'not-configured'

/** Appended rather than replaced, so a reopened request keeps its whole history. */
const recordEmail = async (
  payload: Payload,
  submissionId: number,
  entry: { type: ReservationEmailType; status: RequesterEmailStatus; error?: string },
): Promise<void> => {
  try {
    const current = (await payload.findByID({
      collection: 'access-request-submissions',
      id: submissionId,
      depth: 0,
    })) as AccessRequestSubmission

    await payload.update({
      collection: 'access-request-submissions',
      id: submissionId,
      data: {
        requesterEmails: [
          ...(current.requesterEmails ?? []),
          { ...entry, at: new Date().toISOString() },
        ],
      },
    })
  } catch (error) {
    payload.logger.error(
      `Failed to record ${entry.type} email for reservation ${submissionId}: ${String(error)}`,
    )
  }
}

const loadTemplate = async (
  payload: Payload,
  type: ReservationEmailType,
  language: Language,
): Promise<{ template?: EmailTemplate; replyTo: string; signature?: string | null }> => {
  try {
    const settings = await payload.findGlobal({
      slug: 'reservation-emails',
      locale: language,
      // An empty English text must fall back to the English default, not to
      // the Finnish text.
      fallbackLocale: false,
      depth: 0,
    })

    return {
      template: settings?.[type] ?? undefined,
      replyTo: settings?.replyTo || DEFAULT_REPLY_TO,
      signature: settings?.signature,
    }
  } catch (error) {
    payload.logger.error(`Could not read the reservation email texts: ${String(error)}`)
    return { replyTo: DEFAULT_REPLY_TO }
  }
}

/**
 * Never throws: a reservation decision must stand even when the email does
 * not go out. The outcome is recorded on the submission, and `ok: false` lets
 * the caller flag it in Telegram.
 */
export const sendReservationEmail = async (args: {
  payload: Payload
  submission: AccessRequestSubmission
  target: ReservationTarget
  type: ReservationEmailType
  decider?: Decider
}): Promise<{ ok: boolean; error?: string }> => {
  const { payload, submission, target, type, decider } = args
  const data = (submission.requestData ?? {}) as AccessRequestBody
  const language: Language = data.language === 'en' ? 'en' : 'fi'

  // Without SMTP configured, Payload only logs the email. Recorded as such
  // rather than as sent, and not reported as a failure in Telegram.
  if (!process.env.SMTP_HOST) {
    payload.logger.warn(
      `SMTP_HOST is not set; ${type} email for reservation ${submission.id} not sent`,
    )
    await recordEmail(payload, submission.id, { type, status: 'not-configured' })
    return { ok: true }
  }

  try {
    const { template, replyTo, signature } = await loadTemplate(payload, type, language)
    const email = buildReservationEmail({
      type,
      data,
      target,
      template,
      decider,
      declineReason: submission.declineReason,
      signature,
    })

    await payload.sendEmail({
      to: submission.submitterEmail,
      replyTo: pickReplyTo(type, decider, replyTo),
      subject: email.subject,
      html: email.html,
      text: email.text,
    })

    await recordEmail(payload, submission.id, { type, status: 'sent' })
    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    payload.logger.error(
      `Failed to send ${type} email for reservation ${submission.id}: ${message}`,
    )
    await recordEmail(payload, submission.id, { type, status: 'failed', error: message })

    return { ok: false, error: message }
  }
}
