import type { Block } from 'payload'

export const ContactInfo: Block = {
  slug: 'contactInfo',
  interfaceName: 'ContactInfoBlock',
  labels: {
    singular: 'Yhteystiedot',
    plural: 'Yhteystiedot',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Yhteystiedot',
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        description: 'Contact email address',
      },
    },
    {
      name: 'telegramChannels',
      type: 'array',
      labels: {
        singular: 'Telegram-kanava',
        plural: 'Telegram-kanavat',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            description: 'Telegram link (e.g., https://t.me/otahoas)',
          },
        },
      ],
    },
  ],
}
