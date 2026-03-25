import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { link } from '@/fields/link'

export const AccessRequestForm: Block = {
  slug: 'accessRequestForm',
  interfaceName: 'AccessRequestFormBlock',
  labels: {
    singular: 'Access Request Form',
    plural: 'Access Request Forms',
  },
  fields: [
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
      name: 'enableRulesLink',
      type: 'checkbox',
      label: 'Enable rules page link',
      defaultValue: false,
    },
    link({
      appearances: false,
      disableLabel: true,
      overrides: {
        name: 'rulesLink',
        label: 'Rules page link',
        admin: {
          condition: (_data, siblingData) => Boolean(siblingData?.enableRulesLink),
        },
      },
    }),
    {
      name: 'enableSpacesLink',
      type: 'checkbox',
      label: 'Enable spaces info link',
      defaultValue: false,
    },
    link({
      appearances: false,
      disableLabel: true,
      overrides: {
        name: 'spacesLink',
        label: 'Spaces info link',
        admin: {
          condition: (_data, siblingData) => Boolean(siblingData?.enableSpacesLink),
        },
      },
    }),
    {
      name: 'enableCalendarLink',
      type: 'checkbox',
      label: 'Enable calendar link',
      defaultValue: false,
    },
    link({
      appearances: false,
      disableLabel: true,
      overrides: {
        name: 'calendarLink',
        label: 'Calendar link',
        admin: {
          condition: (_data, siblingData) => Boolean(siblingData?.enableCalendarLink),
        },
      },
    }),
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
