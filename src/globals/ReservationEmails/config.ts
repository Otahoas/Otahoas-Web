import type { Field, GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import {
  DEFAULT_REPLY_TO,
  DEFAULT_SIGNATURES,
  DEFAULT_TEMPLATES,
  type ReservationEmailType,
} from '@/utilities/reservationEmail'

const PLACEHOLDERS = '{name}, {space}, {start}, {end}'

/**
 * The fields open pre-filled with the built-in wording, in the language being
 * edited, so a small change does not mean retyping the whole text. These are
 * the same constants the email code falls back to: a field cleared to empty
 * still sends the built-in text.
 */
const languageOf = (locale: string | undefined): 'fi' | 'en' => (locale === 'en' ? 'en' : 'fi')

/**
 * Only the wording lives here. When each email is sent, who receives it, and
 * the reservation details and contact block appended to it are decided in
 * code (utilities/reservationEmail.ts), so editing these fields cannot break
 * the reservation flow.
 */
const emailFields = (name: ReservationEmailType, label: string, extraPlaceholders = ''): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    {
      name: 'subject',
      type: 'text',
      localized: true,
      defaultValue: ({ locale }) => DEFAULT_TEMPLATES[languageOf(locale)][name].subject,
      admin: {
        description: `Placeholders: ${PLACEHOLDERS}${extraPlaceholders}. Clear the field to go back to the built-in text.`,
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
      defaultValue: ({ locale }) => DEFAULT_TEMPLATES[languageOf(locale)][name].intro,
      admin: {
        description: `Opening text above the contact person and reservation details, which are added automatically. A blank line starts a new paragraph. Placeholders: ${PLACEHOLDERS}${extraPlaceholders}. Clear the field to go back to the built-in text.`,
        rows: 6,
      },
    },
  ],
})

export const ReservationEmails: GlobalConfig = {
  slug: 'reservation-emails',
  label: 'Reservation Emails',
  admin: {
    group: 'Varaukset',
    description:
      'Emails sent to the person who made a reservation request, in the language the request was made in. Switch the locale at the top to edit the Suomi and English versions.',
  },
  access: {
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'replyTo',
      type: 'email',
      label: 'Reply-To address',
      // A function, not a literal, so the default stays out of the database
      // schema and needs no migration.
      defaultValue: () => DEFAULT_REPLY_TO,
      admin: {
        description:
          'Where replies go when there is no contact person yet: the "request received" email, and a decision by someone without an email in the keyholder tab. Accept and decline emails otherwise reply to the person who decided.',
      },
    },
    {
      name: 'signature',
      type: 'textarea',
      localized: true,
      defaultValue: ({ locale }) => DEFAULT_SIGNATURES[languageOf(locale)],
      admin: {
        description:
          'Closing text at the end of every email, below a line: who we are and how to reach the committee. Email addresses and https:// links become clickable. Clear the field to go back to the built-in text.',
        rows: 7,
      },
    },
    emailFields('received', 'Request received'),
    emailFields('accepted', 'Request accepted', ', {decidedBy}'),
    emailFields('declined', 'Request declined', ', {decidedBy}'),
  ],
}
