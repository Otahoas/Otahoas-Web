import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const AccessRequestSubmissions: CollectionConfig = {
  slug: 'access-request-submissions',
  admin: {
    defaultColumns: ['submitterName', 'target', 'status', 'decidedBy', 'sentAt'],
    useAsTitle: 'submitterName',
    group: 'Varaukset',
  },
  access: {
    create: () => true, // Anyone can submit
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'target',
      type: 'relationship',
      relationTo: 'reservation-targets',
      required: true,
      admin: {
        description: 'The reservation target this request is for',
      },
    },
    {
      name: 'submitterName',
      type: 'text',
      required: true,
      label: 'Requester Name',
    },
    {
      name: 'submitterEmail',
      type: 'email',
      required: true,
      label: 'Requester Email',
    },
    {
      name: 'requestData',
      type: 'json',
      required: true,
      admin: {
        description: 'Full form data as submitted',
      },
    },
    {
      name: 'notificationSentTo',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Where the notification was sent (Telegram topic ID)',
      },
    },
    {
      name: 'sentAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      // Despite the name, this tracks the Telegram notification; the field
      // predates Telegram. Emails to the requester are in requesterEmails.
      name: 'emailStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Declined', value: 'declined' },
      ],
      admin: {
        readOnly: true,
        description:
          'Decided from Telegram. Read-only here because changing it would not write to the reservation sheet.',
      },
    },
    {
      name: 'decidedBy',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Name of the keyholder or committee member who decided.',
      },
    },
    {
      name: 'decidedByTelegramId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'decidedByEmail',
      type: 'text',
      admin: {
        readOnly: true,
        description:
          'From the keyholder tab at the time of the decision. Sent to the requester as a contact.',
      },
    },
    {
      name: 'decidedByTelegram',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Telegram username of the decider, sent to the requester as a contact.',
      },
    },
    {
      name: 'decidedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'declineReason',
      type: 'textarea',
      admin: {
        readOnly: true,
        condition: (data) => data?.status === 'declined',
      },
    },
    {
      name: 'overlapWarning',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description:
          'The requester was told this clashes with an existing request and sent it anyway.',
      },
    },
    {
      name: 'telegramMessageId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Message carrying the Accept/Decline buttons, so it can be edited later.',
      },
    },
    {
      name: 'telegramTopicId',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'sheetSyncStatus',
      type: 'select',
      options: [
        { label: 'Not written', value: 'not-written' },
        { label: 'Written', value: 'written' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'not-written',
      admin: {
        readOnly: true,
        description: 'Whether the latest state of this reservation reached the Google Sheet.',
      },
    },
    {
      name: 'sheetRowNumber',
      type: 'number',
      admin: {
        readOnly: true,
        description:
          'Row this reservation occupies. Verified against the Varaus-ID column before being patched.',
      },
    },
    {
      name: 'sheetError',
      type: 'textarea',
      admin: {
        readOnly: true,
        condition: (data) => data?.sheetSyncStatus === 'failed',
      },
    },
    {
      name: 'calendarEventId',
      type: 'text',
      admin: {
        readOnly: true,
        description: "Event in the space's own calendar.",
      },
    },
    {
      name: 'calendarGeneralEventId',
      type: 'text',
      admin: {
        readOnly: true,
        description: 'Entry in the shared calendar, for an approved public event.',
      },
    },
    {
      name: 'calendarSyncStatus',
      type: 'select',
      options: [
        { label: 'Not written', value: 'not-written' },
        { label: 'Written', value: 'written' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'not-written',
      admin: {
        readOnly: true,
        description: 'Whether the latest state of this reservation reached Google Calendar.',
      },
    },
    {
      name: 'calendarError',
      type: 'textarea',
      admin: {
        readOnly: true,
        condition: (data) => data?.calendarSyncStatus === 'failed',
      },
    },
    {
      name: 'errorMessage',
      type: 'textarea',
      admin: {
        readOnly: true,
        condition: (data) => data?.emailStatus === 'failed',
      },
    },
    {
      name: 'requesterEmails',
      type: 'array',
      label: 'Emails to the requester',
      admin: {
        readOnly: true,
        description: 'Every email sent to the requester about this reservation, oldest first.',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'Received', value: 'received' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'Declined', value: 'declined' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          options: [
            { label: 'Sent', value: 'sent' },
            { label: 'Failed', value: 'failed' },
            { label: 'Not configured', value: 'not-configured' },
          ],
        },
        {
          name: 'at',
          type: 'date',
          required: true,
          admin: {
            date: {
              pickerAppearance: 'dayAndTime',
            },
          },
        },
        {
          name: 'error',
          type: 'text',
        },
      ],
    },
  ],
  timestamps: true,
}
