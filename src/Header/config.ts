import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'

export const Header: GlobalConfig = {
  slug: 'header',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Logo image for the header',
      },
    },
    {
      name: 'logoSize',
      type: 'number',
      defaultValue: 48,
      min: 24,
      max: 128,
      admin: {
        description: 'Logo size in pixels (24-128)',
      },
    },
    {
      name: 'siteTitle',
      type: 'text',
      defaultValue: 'OtaHoas',
      localized: true,
      admin: {
        description: 'Site title shown next to logo',
      },
    },
    {
      name: 'navItems',
      type: 'array',
      localized: true,
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader],
  },
}
