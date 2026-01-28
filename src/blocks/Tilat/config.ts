import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Tilat: Block = {
  slug: 'tilat',
  interfaceName: 'TilatBlock',
  fields: [
    {
      name: 'spaces',
      type: 'array',
      label: 'Spaces',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
          localized: true,
          admin: {
            description: 'Optional. If not provided, address will be used as name',
          },
        },
        {
          name: 'address',
          type: 'text',
          required: true,
          label: 'Address',
          localized: true,
        },
        {
          name: 'capacity',
          type: 'text',
          label: 'Capacity',
          localized: true,
        },
        {
          name: 'additionalInfo',
          type: 'richText',
          label: 'Additional Information',
          localized: true,
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [
                ...rootFeatures,
                HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                FixedToolbarFeature(),
                InlineToolbarFeature(),
              ]
            },
          }),
        },
      ],
    },
  ],
}
