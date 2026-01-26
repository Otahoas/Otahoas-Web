'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header, Media } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { HeaderNav } from './Nav'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface HeaderClientProps {
  data: Header
  locale: Locale
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, locale }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  const logo = data.logo as Media | null
  const logoSize = data.logoSize || 48
  const siteTitle = data.siteTitle || 'OtaHoas'

  // Use thumbnail size if available (300px), otherwise fall back to original
  const logoUrl = logo?.sizes?.thumbnail?.url || logo?.url || '/otahoas.png'

  return (
    <header className="container relative z-20   " {...(theme ? { 'data-theme': theme } : {})}>
      <div className="py-8 flex justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt={logo?.alt || siteTitle}
            width={logoSize}
            height={logoSize}
            style={{ width: logoSize, height: logoSize }}
            className="object-contain"
          />
          <span className="font-bold text-xl">{siteTitle}</span>
        </Link>
        <div className="flex items-center gap-4">
          <HeaderNav data={data} locale={locale} />
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </header>
  )
}
