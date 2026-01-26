'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

export const Search: React.FC = () => {
  const [value, setValue] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('common')

  // Extract locale from pathname (e.g., /fi/search -> fi)
  const locale = pathname.split('/')[1] || 'fi'

  const debouncedValue = useDebounce(value)

  useEffect(() => {
    router.push(`/${locale}/search${debouncedValue ? `?q=${debouncedValue}` : ''}`)
  }, [debouncedValue, router, locale])

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Label htmlFor="search" className="sr-only">
          {t('search')}
        </Label>
        <Input
          id="search"
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder={t('searchPlaceholder')}
        />
        <button type="submit" className="sr-only">
          submit
        </button>
      </form>
    </div>
  )
}
