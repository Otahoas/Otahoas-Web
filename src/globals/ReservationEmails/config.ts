import type { Field, GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

const PLACEHOLDERS = '{name}, {space}, {start}, {end}'

/**
 * Only the wording lives here. When each email is sent, who receives it, and
 * the reservation details and contact block appended to it are decided in
 * code (utilities/reservationEmail.ts), so editing these fields cannot break
 * the reservation flow.
 */
const emailFields = (name: string, label: string, extraPlaceholders = ''): Field => ({
  name,
  type: 'group',
  label,
  fields: [
    {
      name: 'subject',
      type: 'text',
      localized: true,
      admin: {
        description: `Leave empty for the built-in text. Placeholders: ${PLACEHOLDERS}${extraPlaceholders}`,
      },
    },
    {
      name: 'intro',
      type: 'textarea',
      localized: true,
      admin: {
        description: `Opening text above the reservation details. Leave empty for the built-in text. Placeholders: ${PLACEHOLDERS}${extraPlaceholders}`,
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
      'Emails sent to the person who made a reservation request. Each is sent in the language the request was made in; write both the Suomi and English versions.',
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
      admin: {
        description:
          'Where replies go when there is no contact person yet: the "request received" email, and a decision by someone without an email in the keyholder tab. Accept and decline emails otherwise reply to the person who decided. Defaults to otahoas@otahoas.fi.',
      },
    },
    {
      name: 'signature',
      type: 'textarea',
      localized: true,
      admin: {
        description:
          'Closing text at the end of every email, below a line: who we are and how to reach the committee. Email addresses and https:// links become clickable. Leave empty for the built-in text.',
      },
    },
    emailFields('received', 'Request received'),
    emailFields('accepted', 'Request accepted', ', {decidedBy}'),
    emailFields('declined', 'Request declined', ', {decidedBy}'),
  ],
}
