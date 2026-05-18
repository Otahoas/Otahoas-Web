'use client'

import type { Theme } from '@/providers/Theme/types'

import React, { createContext, useCallback, useEffect, use, useState } from 'react'

export interface ContextType {
  headerTheme?: Theme | null
  setHeaderTheme: (theme: Theme | null) => void
}

const initialContext: ContextType = {
  headerTheme: undefined,
  setHeaderTheme: () => null,
}

const HeaderThemeContext = createContext(initialContext)

export const HeaderThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [headerTheme, setThemeState] = useState<Theme | undefined | null>(undefined)

  useEffect(() => {
    // Read DOM only after hydration to avoid SSR/CSR mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(document.documentElement.getAttribute('data-theme') as Theme)
  }, [])

  const setHeaderTheme = useCallback((themeToSet: Theme | null) => {
    setThemeState(themeToSet)
  }, [])

  return <HeaderThemeContext value={{ headerTheme, setHeaderTheme }}>{children}</HeaderThemeContext>
}

export const useHeaderTheme = (): ContextType => use(HeaderThemeContext)
