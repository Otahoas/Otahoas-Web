import type { Block } from 'payload'

export const Committee: Block = {
  slug: 'committee',
  interfaceName: 'CommitteeBlock',
  labels: {
    singular: 'Toimikunta',
    plural: 'Toimikunnat',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      defaultValue: 'Toimikunta',
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Optional description shown above the member list',
      },
    },
    {
      name: 'members',
      type: 'array',
      required: true,
      minRows: 1,
      labels: {
        singular: 'Jäsen',
        plural: 'Jäsenet',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          admin: {
            description: 'Optional title/role (e.g., "Puheenjohtaja", "ASY")',
          },
        },
        {
          name: 'telegram',
          type: 'text',
          admin: {
            description: 'Telegram username (without @)',
          },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Profile photo (optional)',
          },
        },
      ],
    },
  ],
}
