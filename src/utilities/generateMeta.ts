import type { Metadata } from 'next'

import type { Media, Page, Post, Config } from '../payload-types'
import type { Locale } from '@/i18n/config'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (
  image?: Media | Config['db']['defaultIDType'] | null,
  locale: Locale = 'fi',
) => {
  const serverUrl = getServerSideURL()

  let url = `${serverUrl}/otahoas_banner_${locale}.png`

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url

    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  locale?: Locale
}): Promise<Metadata> => {
  const { doc, locale = 'fi' } = args

  const ogImage = getImageURL(doc?.meta?.image, locale)

  const title = doc?.title ? doc?.title + ' | OtaHoas' : 'OtaHoas'

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
    }),
    title,
  }
}
