import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'

export const ReservationSettings: GlobalConfig = {
  slug: 'reservation-settings',
  label: 'Reservation Settings',
  admin: {
    group: 'Varaukset',
  },
  access: {
    // Telegram IDs are not public information, so this global is admin-only.
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'keyholderCache',
      type: 'json',
      admin: {
        readOnly: true,
        description:
          'Last known good copy of the keyholder tab in Google Sheets. Written automatically; used only when the sheet cannot be reached.',
      },
    },
    {
      name: 'keyholderCacheUpdatedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
