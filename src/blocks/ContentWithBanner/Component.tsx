import React from 'react'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { cn } from '@/utilities/ui'
import type { Media as MediaType, Page, Post } from '@/payload-types'

type ContentWithBannerItem = {
  title?: string | null
  image?: MediaType | string | number | null
  richText?: Parameters<typeof RichText>[0]['data']
  enableLink?: boolean | null
  link?: {
    type?: 'reference' | 'custom' | null
    reference?: {
      relationTo: 'pages' | 'posts'
      value: Page | Post | string | number
    } | null
    url?: string | null
    newTab?: boolean | null
  } | null
}

type ContentWithBannerBlockProps = {
  widthRatio?: 'balanced' | 'contentWide' | 'bannerWide' | null
  items?: ContentWithBannerItem[] | null
}

const ratioToClasses: Record<
  NonNullable<ContentWithBannerBlockProps['widthRatio']>,
  { left: string; right: string }
> = {
  balanced: {
    left: 'lg:col-span-6 lg:col-start-1',
    right: 'lg:col-span-6 lg:col-start-7',
  },
  contentWide: {
    left: 'lg:col-span-7 lg:col-start-1',
    right: 'lg:col-span-5 lg:col-start-8',
  },
  bannerWide: {
    left: 'lg:col-span-5 lg:col-start-1',
    right: 'lg:col-span-7 lg:col-start-6',
  },
}

export const ContentWithBannerBlock: React.FC<ContentWithBannerBlockProps> = ({
  widthRatio = 'balanced',
  items,
}) => {
  if (!items?.length) return null
  const resolvedRatio = widthRatio ?? 'balanced'
  const ratioClasses = ratioToClasses[resolvedRatio]

  return (
    <div className="container my-16">
      <div className="space-y-12">
        {items.map((item, index) => {
          const hasLink = Boolean(
            item.enableLink && item.link?.type && (item.link?.reference || item.link?.url),
          )

          const sectionContent = (
            <section
              className={cn(
                'grid grid-cols-1 gap-6 rounded-lg lg:grid-cols-12 lg:gap-10',
                hasLink &&
                  'p-4 transition-colors hover:bg-[rgb(238,182,170)] dark:hover:bg-[rgb(37,4,2)]',
              )}
            >
              <div className={cn('contents lg:flex lg:flex-col lg:gap-4', ratioClasses.left)}>
                <h2 className="order-1 text-4xl font-semibold leading-tight">{item.title}</h2>

                <div className="order-3">
                  {item.richText && <RichText data={item.richText} enableGutter={false} />}
                </div>
              </div>

              <div
                className={cn(
                  'order-2 aspect-video w-full overflow-hidden rounded-lg lg:self-start',
                  ratioClasses.right,
                )}
              >
                {typeof item.image === 'object' && item.image !== null && (
                  <Media
                    resource={item.image}
                    className="h-full w-full"
                    imgClassName="h-full w-full object-cover"
                  />
                )}
              </div>
            </section>
          )

          if (hasLink && item.link) {
            return (
              <CMSLink
                key={index}
                appearance="inline"
                type={item.link.type}
                reference={item.link.reference}
                url={item.link.url}
                newTab={item.link.newTab}
                className="block"
              >
                {sectionContent}
              </CMSLink>
            )
          }

          return <React.Fragment key={index}>{sectionContent}</React.Fragment>
        })}
      </div>
    </div>
  )
}
