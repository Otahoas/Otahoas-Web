import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'

export const ReservationTargets: CollectionConfig = {
  slug: 'reservation-targets',
  admin: {
    defaultColumns: ['labelFi', 'telegramTopicId', 'category', 'active'],
    useAsTitle: 'labelFi',
    group: 'Varaukset',
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true, // Public read for dropdown population
    update: authenticated,
  },
  fields: [
    {
      name: 'emailPrefix',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier for this target (e.g., "jmt10cd")',
      },
    },
    {
      name: 'telegramTopicId',
      type: 'text',
      defaultValue: '1',
      admin: {
        description: 'Telegram topic/thread ID where access requests will be sent. Find it by copying a message link from the topic.',
      },
    },
    {
      name: 'labelFi',
      type: 'text',
      required: true,
      label: 'Finnish Label',
      admin: {
        description: 'Label shown in Finnish dropdown',
      },
    },
    {
      name: 'labelEn',
      type: 'text',
      required: true,
      label: 'English Label',
      admin: {
        description: 'Label shown in English dropdown',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Kerhohuone / Club Room', value: 'club-room' },
        { label: 'Paja / Workshop', value: 'workshop' },
        { label: 'Soittohuone / Music Room', value: 'music-room' },
        { label: 'Varasto / Storage', value: 'storage' },
        { label: 'Välineet / Equipment', value: 'equipment' },
      ],
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'If unchecked, this target will not appear in the dropdown',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Lower numbers appear first in the dropdown',
      },
    },
    {
      name: 'googleCalendarId',
      type: 'text',
      admin: {
        description:
          'Google Calendar ID (e.g., "abc123xyz@group.calendar.google.com"). Get from Google Calendar settings → Integrate calendar.',
      },
    },
    {
      name: 'calendarColor',
      type: 'text',
      defaultValue: '#3F51B5',
      admin: {
        description: 'Calendar display color in hex format (e.g., "#3F51B5")',
      },
    },
  ],
  timestamps: true,
}
