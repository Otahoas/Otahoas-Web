import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const AccessRequestSubmissions: CollectionConfig = {
  slug: 'access-request-submissions',
  admin: {
    defaultColumns: ['submitterName', 'target', 'sentAt', 'notificationSentTo'],
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
      name: 'errorMessage',
      type: 'textarea',
      admin: {
        readOnly: true,
        condition: (data) => data?.emailStatus === 'failed',
      },
    },
  ],
  timestamps: true,
}
