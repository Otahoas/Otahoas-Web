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
      name: 'generalCalendarId',
      type: 'text',
      label: 'Shared calendar for public events',
      admin: {
        description:
          'Google Calendar ID the public events of approved bookings are published to (e.g. example@group.calendar.google.com). Each space has its own calendar on its reservation target; this is the one that belongs to no single space. Share it with the service account as "Make changes to events".',
      },
    },
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
