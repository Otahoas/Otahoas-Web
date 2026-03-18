'use client'
import React from 'react'
import type { TilatBlock as TilatBlockType, Page } from '@/payload-types'
import type { Locale } from '@/i18n/config'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'
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
        {spaces.map((space, index) => (
          <div
            key={index}
            className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md"
          >
            {space.image && (
              <div>
                <Media resource={space.image} imgClassName="w-full h-48 object-cover rounded-md" />
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
              <div className="mb-4 border-t px-6 pt-4 text-sm text-foreground/80 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
                <RichText data={space.additionalInfo} enableProse={false} enableGutter={false} />
              </div>
            )}

            {space.linkedPage &&
              typeof space.linkedPage === 'object' &&
              'slug' in space.linkedPage && (
                <p className="mb-4 mt-auto px-6 text-sm">
                  <CMSLink
                    type="reference"
                    appearance="inline"
                    className="text-foreground/70 underline underline-offset-4 hover:text-foreground"
                    locale={locale}
                    reference={{
                      relationTo: 'pages',
                      value: space.linkedPage as Page,
                    }}
                    label={t('moreInfo')}
                  />
                </p>
              )}
          </div>
        ))}
      </div>
    </div>
  )
}
