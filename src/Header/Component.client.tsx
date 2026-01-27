'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

import type { Header, Media } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { HeaderNav } from './Nav'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface HeaderClientProps {
  data: Header
  locale: Locale
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, locale }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    setMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
  }, [headerTheme, theme])

  const logo = data.logo as Media | null
  const logoSize = data.logoSize || 48
  const siteTitle = data.siteTitle || 'OtaHoas'

  const logoUrl = logo?.sizes?.thumbnail?.url || logo?.url || '/otahoas.png'

  return (
    <header className="container relative z-20" {...(theme ? { 'data-theme': theme } : {})}>
      <div className="py-4 md:py-8 flex justify-between items-center">
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

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <HeaderNav data={data} locale={locale} />
          <LanguageSwitcher locale={locale} />
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="md:hidden pb-4 border-t pt-4">
          <nav className="flex flex-col gap-4">
            <HeaderNav data={data} locale={locale} mobile />
            <LanguageSwitcher locale={locale} />
          </nav>
        </div>
      )}
    </header>
  )
}
