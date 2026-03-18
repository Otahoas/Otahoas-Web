import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const ContentWithBanner: Block = {
  slug: 'contentWithBanner',
  interfaceName: 'ContentWithBannerBlock',
  fields: [
    {
      name: 'widthRatio',
      type: 'select',
      defaultValue: 'balanced',
      options: [
        {
          label: 'Balanced (50 / 50)',
          value: 'balanced',
        },
        {
          label: 'Content Wide (60 / 40)',
          value: 'contentWide',
        },
        {
          label: 'Banner Wide (40 / 60)',
          value: 'bannerWide',
        },
      ],
      required: true,
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      required: true,
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          localized: true,
          required: true,
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'richText',
          type: 'richText',
          localized: true,
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [
                ...rootFeatures,
                HeadingFeature({ enabledHeadingSizes: ['h3', 'h4'] }),
                FixedToolbarFeature(),
                InlineToolbarFeature(),
              ]
            },
          }),
          label: false,
          required: true,
        },
        {
          name: 'linkToPage',
          type: 'checkbox',
          label: 'Link to a page',
        },
        {
          name: 'linkedPage',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
          admin: {
            condition: (_data, siblingData) => Boolean(siblingData?.linkToPage),
          },
        },
      ],
    },
  ],
}
