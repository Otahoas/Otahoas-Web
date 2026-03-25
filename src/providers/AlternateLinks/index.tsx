'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import type { Locale } from '@/i18n/config'

type AlternateLinks = Partial<Record<Locale, string>>

const AlternateLinksContext = createContext<{
  links: AlternateLinks
  setLinks: (links: AlternateLinks) => void
}>({ links: {}, setLinks: () => {} })

export const AlternateLinksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [links, setLinks] = useState<AlternateLinks>({})
  return (
    <AlternateLinksContext.Provider value={{ links, setLinks }}>
      {children}
    </AlternateLinksContext.Provider>
  )
}

export const useAlternateLinks = () => useContext(AlternateLinksContext)

export const SetAlternateLinks: React.FC<{ links: AlternateLinks }> = ({ links }) => {
  const { setLinks } = useAlternateLinks()
  useEffect(() => {
    setLinks(links)
  }, [JSON.stringify(links)]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}
