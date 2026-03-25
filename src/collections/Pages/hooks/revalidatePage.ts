import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Page } from '../../../payload-types'
import { locales } from '../../../i18n/config'

export const revalidatePage: CollectionAfterChangeHook<Page> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      for (const locale of locales) {
        const localizedDoc = await payload.findByID({
          collection: 'pages',
          id: doc.id,
          locale,
          select: { slug: true },
        })
        const slug = localizedDoc.slug as string
        const path = slug === 'home' ? `/${locale}` : `/${locale}/${slug}`
        payload.logger.info(`Revalidating page at path: ${path}`)
        revalidatePath(path)
      }
      revalidateTag('pages-sitemap')
    }

    // If the page was previously published, we need to revalidate the old path
    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      for (const locale of locales) {
        const localizedDoc = await payload.findByID({
          collection: 'pages',
          id: doc.id,
          locale,
          select: { slug: true },
        })
        const slug = localizedDoc.slug as string
        const oldPath = slug === 'home' ? `/${locale}` : `/${locale}/${slug}`
        payload.logger.info(`Revalidating old page at path: ${oldPath}`)
        revalidatePath(oldPath)
      }
      revalidateTag('pages-sitemap')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Page> = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    for (const locale of locales) {
      const slug = (doc?.slug as string) || ''
      const path = slug === 'home' ? `/${locale}` : `/${locale}/${slug}`
      revalidatePath(path)
    }
    revalidateTag('pages-sitemap')
  }

  return doc
}
