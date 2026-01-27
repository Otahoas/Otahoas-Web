import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import '../globals.css'
import { getServerSideURL } from '@/utilities/getURL'
import { locales, type Locale } from '@/i18n/config'
import { hasLocale } from 'next-intl'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!hasLocale(locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const { isEnabled } = await draftMode()
  const messages = await getMessages()

  return (
    <html
      className={cn(GeistSans.variable, GeistMono.variable)}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/otahoas.png" rel="icon" type="image/png" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <AdminBar
              adminBarProps={{
                preview: isEnabled,
              }}
            />

            <Header locale={locale as Locale} />
            {children}
            <Footer locale={locale as Locale} />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params

  const descriptions: Record<string, string> = {
    fi: 'Otaniemen asukastoimikunta - kerhohuoneet ja yhteiset tilat',
    en: "Otaniemi Residents' Committee - club rooms and shared spaces",
  }

  const description = descriptions[locale] || descriptions.fi

  return {
    title: {
      default: 'OtaHoas',
      template: '%s | OtaHoas',
    },
    description,
    metadataBase: new URL(getServerSideURL()),
    openGraph: mergeOpenGraph(undefined, description),
    twitter: {
      card: 'summary_large_image',
    },
  }
}
