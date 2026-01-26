import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import React from 'react'

import type { Header } from '@/payload-types'
import type { Locale } from '@/i18n/config'

type Props = {
  locale: Locale
}

export async function Header({ locale }: Props) {
  const headerData: Header = await getCachedGlobal('header', 2, locale)()

  return <HeaderClient data={headerData} locale={locale} />
}
