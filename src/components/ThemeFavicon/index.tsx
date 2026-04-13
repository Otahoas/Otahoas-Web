'use client'
import { useEffect } from 'react'
import { useTheme } from '@/providers/Theme'

export const ThemeFavicon = () => {
  const { theme } = useTheme()

  useEffect(() => {
    const link = document.getElementById('favicon') as HTMLLinkElement | null
    if (link) {
      link.href = theme === 'dark' ? '/otahoas_dark.png' : '/otahoas_light.png'
    }
  }, [theme])

  return null
}
