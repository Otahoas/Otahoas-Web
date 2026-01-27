'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'
import type { Locale } from '@/i18n/config'

import { CMSLink } from '@/components/Link'

interface HeaderNavProps {
  data: HeaderType
  locale: Locale
  mobile?: boolean
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, locale, mobile }) => {
  const navItems = data?.navItems || []

  return (
    <nav className={mobile ? 'flex flex-col gap-3' : 'flex gap-3 items-center'}>
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...link} appearance="link" locale={locale} />
      })}
    </nav>
  )
}
