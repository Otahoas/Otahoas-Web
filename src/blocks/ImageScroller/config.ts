import type { Block } from 'payload'

export const ImageScroller: Block = {
  slug: 'imageScroller',
  interfaceName: 'ImageScrollerBlock',
  fields: [
    {
      name: 'displayMode',
      type: 'radio',
      label: 'Display Mode',
      defaultValue: 'grid',
      options: [
        {
          label: 'Grid',
          value: 'grid',
        },
        {
          label: 'Carousel',
          value: 'carousel',
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      label: 'Images',
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Caption',
          localized: true,
        },
      ],
    },
  ],
}
