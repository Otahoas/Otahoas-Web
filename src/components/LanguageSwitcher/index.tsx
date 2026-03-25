'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { locales, type Locale } from '@/i18n/config'
import { useTranslations } from 'next-intl'
import { cn } from '@/utilities/ui'
import { useAlternateLinks } from '@/providers/AlternateLinks'

type Props = {
  locale: Locale
  className?: string
}

export const LanguageSwitcher: React.FC<Props> = ({ locale, className }) => {
  const pathname = usePathname()
  const t = useTranslations('language')
  const { links } = useAlternateLinks()

  const otherLocale = locales.find((l) => l !== locale) as Locale

  // Use the locale-specific alternate link if available, otherwise fall back to swapping the locale prefix
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'
  const href = links[otherLocale] ?? `/${otherLocale}${pathWithoutLocale}`

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-1 text-sm font-medium text-foreground hover:underline',
        className,
      )}
      title={`${t('switchTo')} ${t(otherLocale)}`}
    >
      <span className="uppercase">{otherLocale}</span>
    </Link>
  )
}
