import { locales, type Locale } from '@/i18n/config'

type InternalRelation = 'pages' | 'posts'

const localePrefixRegex = new RegExp(`^/(${locales.join('|')})(/|$)`)

export const buildInternalDocPath = ({
  relationTo,
  slug,
}: {
  relationTo: InternalRelation
  slug: string
}) => {
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

export const isExternalHref = (href: string) => {
  return (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  )
}

export const localizeInternalHref = ({ href, locale }: { href: string; locale?: Locale }) => {
  if (
    !locale ||
    isExternalHref(href) ||
    href.startsWith('/admin') ||
    localePrefixRegex.test(href)
  ) {
    return href
  }

  const cleanHref = href.startsWith('/') ? href : `/${href}`
  return `/${locale}${cleanHref}`
}

export const buildLocalizedInternalDocHref = ({
  relationTo,
  slug,
  locale,
}: {
  relationTo: InternalRelation
  slug: string
  locale?: Locale
}) => {
  const internalPath = buildInternalDocPath({ relationTo, slug })
  return localizeInternalHref({ href: internalPath, locale })
}
