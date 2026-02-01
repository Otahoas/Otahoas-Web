import type { Block } from 'payload'

export const CalendarEmbed: Block = {
  slug: 'calendarEmbed',
  interfaceName: 'CalendarEmbedBlock',
  labels: {
    singular: 'Calendar Embed',
    plural: 'Calendar Embeds',
  },
  fields: [
    {
      name: 'useCombinedCalendars',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'If checked, combines all Google calendars from active Reservation Targets instead of using a single URL',
      },
    },
    {
      name: 'calendarUrl',
      type: 'text',
      admin: {
        description: 'Google Calendar embed URL (get from Google Calendar settings → Integrate calendar)',
        condition: (_, siblingData) => !siblingData?.useCombinedCalendars,
      },
    },
    {
      name: 'publicEventsCalendarId',
      type: 'text',
      admin: {
        description:
          'Public events Google Calendar ID (e.g., example@group.calendar.google.com). This calendar will be combined with reservation target calendars.',
        condition: (_, siblingData) => siblingData?.useCombinedCalendars,
      },
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 600,
      admin: {
        description: 'Calendar height in pixels',
      },
    },
    {
      name: 'language',
      type: 'select',
      defaultValue: 'fi',
      options: [
        { label: 'Suomi', value: 'fi' },
        { label: 'English', value: 'en' },
      ],
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Optional title shown above the calendar',
      },
    },
  ],
}
