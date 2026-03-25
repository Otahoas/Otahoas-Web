import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { locales, type Locale } from '@/i18n/config'
import { setRequestLocale } from 'next-intl/server'
import { SetAlternateLinks } from '@/providers/AlternateLinks'

type Args = {
  params: Promise<{
    locale: string
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { locale, slug = 'home' } = await paramsPromise

  setRequestLocale(locale)

  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug: decodedSlug,
    locale: locale as Locale,
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  const alternateLinks = await getAlternateSlugs({ id: page.id, currentLocale: locale as Locale })

  return (
    <article className="pb-24 pt-16">
      <PageClient />
      <SetAlternateLinks links={alternateLinks} />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({
    slug: decodedSlug,
    locale: locale as Locale,
  })

  return generateMeta({ doc: page, locale: locale as Locale })
}

const getAlternateSlugs = cache(
  async ({ id, currentLocale }: { id: string | number | undefined; currentLocale: Locale }) => {
    if (!id) return {}
    const payload = await getPayload({ config: configPromise })
    const result: Partial<Record<Locale, string>> = {}

    for (const locale of locales) {
      if (locale === currentLocale) continue
      const doc = await payload.findByID({
        collection: 'pages',
        id,
        locale,
        select: { slug: true },
      })
      const slug = doc.slug as string
      result[locale] = slug === 'home' ? `/${locale}` : `/${locale}/${slug}`
    }

    return result
  },
)

const queryPageBySlug = cache(async ({ slug, locale }: { slug: string; locale: Locale }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    locale,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
