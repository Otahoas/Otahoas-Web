'use client'

import React from 'react'
import type { CalendarEmbedBlock as CalendarEmbedBlockProps } from '@/payload-types'

export const CalendarEmbedBlock: React.FC<CalendarEmbedBlockProps> = (props) => {
  const { calendarUrl, title } = props
  const height = props.height ?? 600
  const language = props.language ?? 'fi'

  // Ensure the URL has the correct language parameter
  const processedUrl = React.useMemo(() => {
    if (!calendarUrl) return ''

    try {
      const url = new URL(calendarUrl)
      url.searchParams.set('hl', language)
      return url.toString()
    } catch {
      // If URL parsing fails, return as-is
      return calendarUrl
    }
  }, [calendarUrl, language])

  if (!calendarUrl) {
    return (
      <div className="container my-16">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
          {language === 'fi'
            ? 'Kalenterin URL-osoitetta ei ole määritetty.'
            : 'Calendar URL is not configured.'}
        </div>
      </div>
    )
  }

  return (
    <div className="container my-16">
      {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
      <div className="w-full overflow-hidden rounded-lg border border-gray-200">
        <iframe
          src={processedUrl}
          style={{ border: 0 }}
          width="100%"
          height={height}
          frameBorder="0"
          scrolling="no"
          title={title || (language === 'fi' ? 'Kalenteri' : 'Calendar')}
          className="w-full"
        />
      </div>
    </div>
  )
}
