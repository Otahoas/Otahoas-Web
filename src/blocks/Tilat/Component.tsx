'use client'
import React from 'react'
import type { TilatBlock as TilatBlockType } from '@/payload-types'
import RichText from '@/components/RichText'
import { useTranslations } from 'next-intl'

export const TilatBlock: React.FC<TilatBlockType> = (props) => {
  const { spaces } = props
  const t = useTranslations('spaces')

  if (!spaces || spaces.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {spaces.map((space, index) => (
          <div
            key={index}
            className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">{space.name || space.address}</h3>
            <p className="text-gray-600 mb-2">{space.address}</p>
            {space.capacity && (
              <p className="text-gray-600 mb-4">
                <span className="font-medium">{t('capacity')}:</span> {space.capacity}
              </p>
            )}

            {space.additionalInfo && (
              <div className="mt-4 pt-4 border-t [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1 text-sm text-gray-700">
                <RichText data={space.additionalInfo} enableProse={false} enableGutter={false} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
