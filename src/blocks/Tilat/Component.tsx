'use client'
import React from 'react'
import type { TilatBlock as TilatBlockType, Page } from '@/payload-types'
import type { Locale } from '@/i18n/config'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'
import { useLocale, useTranslations } from 'next-intl'

export const TilatBlock: React.FC<TilatBlockType> = (props) => {
  const { spaces, title } = props
  const t = useTranslations('spaces')
  const locale = useLocale() as Locale

  if (!spaces || spaces.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto">
      {title && <h2 className="text-2xl font-semibold mb-6">{title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space, index) => (
          <div
            key={index}
            className="border rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            {space.image && (
              <div>
                <Media resource={space.image} imgClassName="w-full h-48 object-cover rounded-md" />
              </div>
            )}
            <h3 className="text-xl font-semibold mt-4 px-6">{space.name || space.address}</h3>
            <p className="text-gray-600 mb-2 px-6">{space.address}</p>

            {space.capacity && (
              <p className="text-gray-600 mb-2 px-6">
                <span className="font-medium">{t('capacity')}:</span> {space.capacity}
              </p>
            )}

            {space.additionalInfo && (
              <div className="mb-4 pt-4 px-6 border-t [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 text-sm text-gray-700">
                <RichText data={space.additionalInfo} enableProse={false} enableGutter={false} />
              </div>
            )}

            {space.linkedPage &&
              typeof space.linkedPage === 'object' &&
              'slug' in space.linkedPage && (
                <p className="text-sm mt-auto mb-4 px-6">
                  <CMSLink
                    type="reference"
                    appearance="inline"
                    className="text-blue-600 hover:underline"
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
