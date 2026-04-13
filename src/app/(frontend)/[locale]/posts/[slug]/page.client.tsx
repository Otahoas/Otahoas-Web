'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

const PageClient: React.FC = () => {
  /* Follow the global theme on post pages */
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme(null)
  }, [setHeaderTheme])
  return <React.Fragment />
}

export default PageClient
