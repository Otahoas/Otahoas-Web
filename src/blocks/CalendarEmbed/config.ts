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
      name: 'calendarUrl',
      type: 'text',
      required: true,
      admin: {
        description: 'Google Calendar embed URL (get from Google Calendar settings → Integrate calendar)',
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
