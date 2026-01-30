import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const AccessRequestForm: Block = {
  slug: 'accessRequestForm',
  interfaceName: 'AccessRequestFormBlock',
  labels: {
    singular: 'Access Request Form',
    plural: 'Access Request Forms',
  },
  fields: [
    {
      name: 'language',
      type: 'select',
      defaultValue: 'fi',
      localized: true,
      required: true,
      options: [
        { label: 'Suomi', value: 'fi' },
        { label: 'English', value: 'en' },
      ],
    },
    {
      name: 'introContent',
      type: 'richText',
      label: 'Introduction Content',
      localized: true,
      admin: {
        description: 'Content shown above the form (rules, guidelines, etc.)',
      },
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
    {
      name: 'rulesPageLink',
      type: 'text',
      admin: {
        description: 'Link to rules page (e.g., /saannot)',
      },
    },
    {
      name: 'spacesInfoLink',
      type: 'text',
      admin: {
        description: 'Link to spaces information page',
      },
    },
    {
      name: 'calendarLink',
      type: 'text',
      admin: {
        description: 'Link to calendar page (e.g., /kalenteri)',
      },
    },
    {
      name: 'confirmationMessage',
      type: 'richText',
      label: 'Confirmation Message',
      localized: true,
      admin: {
        description: 'Message shown after successful submission',
      },
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
}
