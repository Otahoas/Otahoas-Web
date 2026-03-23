import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { CalendarEmbedBlock } from '@/blocks/CalendarEmbed/Component'
import { CommitteeBlock } from '@/blocks/Committee/Component'
import { ContactInfoBlock } from '@/blocks/ContactInfo/Component'
import { ImageScrollerBlock } from '@/blocks/ImageScroller/Component'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

const nestedBlockComponents = {
  mediaBlock: MediaBlock,
  calendarEmbed: CalendarEmbedBlock,
  committee: CommitteeBlock,
  contactInfo: ContactInfoBlock,
  imageScroller: ImageScrollerBlock,
}

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  return (
    <div className="container my-16">
      <div className="grid grid-cols-4 gap-x-16 gap-y-8 lg:grid-cols-12">
        {columns &&
          columns.length > 0 &&
          columns.map((col, index) => {
            const { enableLink, link, richText, size } = col
            const nestedBlocks = (col as { blocks?: Array<{ blockType?: string; id?: string }> })
              .blocks

            return (
              <div
                className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                  'md:col-span-2': size !== 'full',
                })}
                key={index}
              >
                {richText && <RichText data={richText} enableGutter={false} />}

                {nestedBlocks && nestedBlocks.length > 0 && (
                  <div className="mt-6 space-y-6">
                    {nestedBlocks.map((block, nestedIndex) => {
                      const { blockType } = block

                      if (blockType && blockType in nestedBlockComponents) {
                        const Block =
                          nestedBlockComponents[blockType as keyof typeof nestedBlockComponents]

                        if (Block) {
                          return (
                            <div key={block.id || nestedIndex}>
                              {/* @ts-expect-error there may be some mismatch between the expected types here */}
                              <Block {...block} disableInnerContainer />
                            </div>
                          )
                        }
                      }

                      return null
                    })}
                  </div>
                )}

                {enableLink && <CMSLink {...link} />}
              </div>
            )
          })}
      </div>
    </div>
  )
}
