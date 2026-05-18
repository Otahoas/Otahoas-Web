'use client'
import React from 'react'
import Link from 'next/link'
import type { TilatBlock as TilatBlockType, Page } from '@/payload-types'
import type { Locale } from '@/i18n/config'
import RichText from '@/components/RichText/Client'
import { Media } from '@/components/Media'
import { buildLocalizedInternalDocHref } from '@/utilities/localizedHref'
import { useLocale, useTranslations } from 'next-intl'

export const TilatBlock: React.FC<TilatBlockType> = (props) => {
  const { spaces, title, anchorId } = props
  const t = useTranslations('spaces')
  const locale = useLocale() as Locale

  if (!spaces || spaces.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto" id={anchorId || undefined}>
      {title && <h2 className="mb-6 text-2xl font-semibold">{title}</h2>}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {spaces.map((space, index) => {
          const linkedPage =
            space.linkedPage && typeof space.linkedPage === 'object' && 'slug' in space.linkedPage
              ? (space.linkedPage as Page)
              : null
          const href = linkedPage?.slug
            ? buildLocalizedInternalDocHref({
                relationTo: 'pages',
                slug: linkedPage.slug,
                locale,
              })
            : null

          return (
            <div
              key={index}
              className={
                'group relative flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm transition-all ' +
                (href
                  ? 'cursor-pointer hover:-translate-y-0.5 hover:border-primary hover:shadow-lg'
                  : 'hover:shadow-md')
              }
            >
              {href && (
                <Link
                  href={href}
                  className="absolute inset-0 z-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={space.name || space.address || t('moreInfo')}
                />
              )}

              {space.image && (
                <div>
                  <Media
                    resource={space.image}
                    imgClassName="w-full h-48 object-cover rounded-md"
                  />
                </div>
              )}
              <h3 className="mt-4 px-6 text-xl font-semibold">{space.name || space.address}</h3>
              <p className="mb-2 px-6 text-muted-foreground">{space.address}</p>

              {space.capacity && (
                <p className="mb-2 px-6 text-muted-foreground">
                  <span className="font-medium">{t('capacity')}:</span> {space.capacity}
                </p>
              )}

              {space.additionalInfo && (
                <div className="mb-4 border-t px-6 pt-4 text-sm text-foreground/80 [&_a]:relative [&_a]:z-10 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
                  <RichText
                    data={space.additionalInfo}
                    enableProse={false}
                    enableGutter={false}
                    locale={locale}
                  />
                </div>
              )}

              {href && (
                <p className="mb-4 mt-auto px-6 text-sm text-foreground/70 transition-colors group-hover:text-foreground">
                  {t('moreInfo')}{' '}
                  <span
                    aria-hidden
                    className="inline-block transition-transform group-hover:translate-x-1"
                  >
                    →
                  </span>
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
