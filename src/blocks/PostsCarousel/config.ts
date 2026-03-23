import type { Block } from 'payload'

export const PostsCarousel: Block = {
  slug: 'postsCarousel',
  interfaceName: 'PostsCarouselBlock',
  labels: {
    singular: 'Posts Carousel',
    plural: 'Posts Carousels',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      admin: {
        description: 'Optional heading shown above the posts carousel',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 9,
      min: 1,
      max: 24,
      admin: {
        description: 'Maximum number of latest posts to show',
      },
    },
  ],
}
