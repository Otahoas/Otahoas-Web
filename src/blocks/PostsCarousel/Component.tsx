import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'

import { PostsCarouselClient } from '@/blocks/PostsCarousel/PostsCarouselClient'
import type { Post, PostsCarouselBlock as PostsCarouselBlockProps } from '@/payload-types'
import type { Locale } from '@/i18n/config'

export const PostsCarouselBlock: React.FC<PostsCarouselBlockProps & { locale?: Locale }> = async (
  props,
) => {
  const payload = await getPayload({ config: configPromise })
  const limit = props.limit ?? 9

  const postsResult = await payload.find({
    collection: 'posts',
    depth: 1,
    limit,
    locale: props.locale,
    sort: '-publishedAt',
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  const posts = postsResult.docs as Post[]

  if (!posts.length) return null

  return <PostsCarouselClient posts={posts} title={props.title} />
}
