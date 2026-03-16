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
      localized: true,
      defaultValue: 'Yhteystiedot',
    },
    {
      name: 'links',
      type: 'array',
      labels: {
        singular: 'Yhteystieto',
        plural: 'Yhteystiedot',
      },
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'email',
          options: [
            { label: 'Email', value: 'email' },
            { label: 'Telegram', value: 'telegram' },
            { label: 'Website', value: 'website' },
          ],
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          admin: {
            description: 'Display text for the link',
          },
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          admin: {
            description: 'Email address, Telegram link, or website URL',
          },
        },
      ],
    },
  ],
}
