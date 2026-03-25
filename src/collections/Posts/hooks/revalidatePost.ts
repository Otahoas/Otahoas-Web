import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'
import { locales } from '../../../i18n/config'

export const revalidatePost: CollectionAfterChangeHook<Post> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      for (const locale of locales) {
        const localizedDoc = await payload.findByID({
          collection: 'posts',
          id: doc.id,
          locale,
          select: { slug: true },
        })
        const slug = localizedDoc.slug as string
        const path = `/${locale}/posts/${slug}`
        payload.logger.info(`Revalidating post at path: ${path}`)
        revalidatePath(path)
      }
      revalidateTag('posts-sitemap')
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      for (const locale of locales) {
        const localizedDoc = await payload.findByID({
          collection: 'posts',
          id: doc.id,
          locale,
          select: { slug: true },
        })
        const slug = localizedDoc.slug as string
        const oldPath = `/${locale}/posts/${slug}`
        payload.logger.info(`Revalidating old post at path: ${oldPath}`)
        revalidatePath(oldPath)
      }
      revalidateTag('posts-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    for (const locale of locales) {
      const slug = (doc?.slug as string) || ''
      const path = `/${locale}/posts/${slug}`
      revalidatePath(path)
    }
    revalidateTag('posts-sitemap')
  }

  return doc
}
