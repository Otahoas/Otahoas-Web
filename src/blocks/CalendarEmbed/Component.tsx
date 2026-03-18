'use client'

import React from 'react'
import type { CalendarEmbedBlock as CalendarEmbedBlockProps } from '@/payload-types'

interface CalendarData {
  googleCalendarId: string
  calendarColor: string
  labelFi: string
  labelEn: string
}

export const CalendarEmbedBlock: React.FC<CalendarEmbedBlockProps> = (props) => {
  const { calendarUrl, title, useCombinedCalendars, publicEventsCalendarId, defaultView } = props
  const height = props.height ?? 600
  const language = props.language ?? 'fi'

  const [combinedCalendarUrl, setCombinedCalendarUrl] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Fetch calendar data when using combined calendars
  React.useEffect(() => {
    if (!useCombinedCalendars) {
      setCombinedCalendarUrl(null)
      return
    }

    const fetchCalendars = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/reservation-target-calendars')
        if (!response.ok) {
          throw new Error('Failed to fetch calendars')
        }

        const data = await response.json()
        const calendars: CalendarData[] = data.calendars || []

        if (calendars.length === 0) {
          setError(
            language === 'fi' ? 'Ei kalentereita näytettäväksi.' : 'No calendars to display.',
          )
          setCombinedCalendarUrl(null)
          return
        }

        // Add public events calendar if configured
        const allCalendars = [...calendars]
        if (publicEventsCalendarId) {
          allCalendars.push({
            googleCalendarId: publicEventsCalendarId,
            calendarColor: '#039BE5', // Blue color for public events
            labelFi: 'Tapahtumat',
            labelEn: 'Events',
          })
        }

        // Build the combined Google Calendar embed URL
        const url = buildCombinedCalendarUrl(allCalendars, language, defaultView ?? 'month')
        setCombinedCalendarUrl(url)
      } catch (err) {
        console.error('Failed to fetch calendars:', err)
        setError(
          language === 'fi' ? 'Kalentereiden lataus epäonnistui.' : 'Failed to load calendars.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchCalendars()
  }, [useCombinedCalendars, language, publicEventsCalendarId, defaultView])

  // Ensure the URL has the correct language parameter for single calendar mode
  const processedUrl = React.useMemo(() => {
    if (useCombinedCalendars) {
      return combinedCalendarUrl || ''
    }

    if (!calendarUrl) return ''

    try {
      const url = new URL(calendarUrl)
      url.searchParams.set('hl', language)
      url.searchParams.set('mode', mapDefaultViewToGoogleMode(defaultView ?? 'month'))
      return url.toString()
    } catch {
      // If URL parsing fails, return as-is
      return calendarUrl
    }
  }, [calendarUrl, language, useCombinedCalendars, combinedCalendarUrl, defaultView])

  // Show loading state for combined calendars
  if (useCombinedCalendars && loading) {
    return (
      <div className="container my-16">
        {title && <h2 className="mb-6 text-2xl font-bold">{title}</h2>}
        <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">
            {language === 'fi' ? 'Ladataan kalentereita...' : 'Loading calendars...'}
          </span>
        </div>
      </div>
    )
  }

  // Show error state
  if (useCombinedCalendars && error) {
    return (
      <div className="container my-16">
        {title && <h2 className="mb-6 text-2xl font-bold">{title}</h2>}
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          {error}
        </div>
      </div>
    )
  }

  // Show warning if no URL configured (single calendar mode)
  if (!useCombinedCalendars && !calendarUrl) {
    return (
      <div className="container my-16">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          {language === 'fi'
            ? 'Kalenterin URL-osoitetta ei ole määritetty.'
            : 'Calendar URL is not configured.'}
        </div>
      </div>
    )
  }

  // Don't render if we don't have a URL yet
  if (!processedUrl) {
    return null
  }

  return (
    <div className="container my-16">
      {title && <h2 className="mb-6 text-2xl font-bold">{title}</h2>}
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

function buildCombinedCalendarUrl(
  calendars: CalendarData[],
  language: string,
  defaultView: 'month' | 'week' | 'schedule',
): string {
  const baseUrl = new URL('https://calendar.google.com/calendar/embed')

  // Set base parameters
  baseUrl.searchParams.set('wkst', '2') // Week starts on Monday
  baseUrl.searchParams.set('bgcolor', '#ffffff')
  baseUrl.searchParams.set('ctz', 'Europe/Helsinki')
  baseUrl.searchParams.set('hl', language)
  baseUrl.searchParams.set('showCalendars', '1')
  baseUrl.searchParams.set('showTabs', '1')
  baseUrl.searchParams.set('showPrint', '0')
  baseUrl.searchParams.set('showDate', '1')
  baseUrl.searchParams.set('showNav', '1')
  baseUrl.searchParams.set('showTz', '1')
  baseUrl.searchParams.set('mode', mapDefaultViewToGoogleMode(defaultView))
  baseUrl.searchParams.set('title', 'OtaHoas')

  // Add each calendar as a src parameter with its color
  calendars.forEach((calendar) => {
    baseUrl.searchParams.append('src', calendar.googleCalendarId)
    baseUrl.searchParams.append('color', calendar.calendarColor || '#3F51B5')
  })

  return baseUrl.toString()
}

function mapDefaultViewToGoogleMode(defaultView: 'month' | 'week' | 'schedule'): string {
  if (defaultView === 'week') return 'WEEK'
  if (defaultView === 'schedule') return 'AGENDA'
  return 'MONTH'
}
