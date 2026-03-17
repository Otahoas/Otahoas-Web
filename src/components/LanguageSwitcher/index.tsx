'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { locales, type Locale } from '@/i18n/config'
import { useTranslations } from 'next-intl'
import { cn } from '@/utilities/ui'

type Props = {
  locale: Locale
  className?: string
}

export const LanguageSwitcher: React.FC<Props> = ({ locale, className }) => {
  const pathname = usePathname()
  const t = useTranslations('language')

  // Remove current locale from pathname to get the base path
  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'

  const otherLocale = locales.find((l) => l !== locale) as Locale

  return (
    <Link
      href={`/${otherLocale}${pathWithoutLocale}`}
      className={cn(
        'flex items-center gap-1 text-sm font-medium hover:underline text-foreground',
        className,
      )}
      title={`${t('switchTo')} ${t(otherLocale)}`}
    >
      <span className="uppercase">{otherLocale}</span>
    </Link>
  )
}
