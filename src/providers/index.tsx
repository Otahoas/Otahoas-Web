import React from 'react'

import { AlternateLinksProvider } from './AlternateLinks'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <AlternateLinksProvider>{children}</AlternateLinksProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
