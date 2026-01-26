import Link from 'next/link'
import React from 'react'
import { getLocale, getTranslations } from 'next-intl/server'

import { Button } from '@/components/ui/button'

export default async function NotFound() {
  const locale = await getLocale()
  const t = await getTranslations('common')

  return (
    <div className="container py-28">
      <div className="prose max-w-none">
        <h1 style={{ marginBottom: 0 }}>404</h1>
        <p className="mb-4">{t('pageNotFoundDescription')}</p>
      </div>
      <Button asChild variant="default">
        <Link href={`/${locale}`}>{t('backToHome')}</Link>
      </Button>
    </div>
  )
}
