import type { Metadata } from 'next/types'

import { CollectionArchive } from '@/components/CollectionArchive'
import { PageRange } from '@/components/PageRange'
import { Pagination } from '@/components/Pagination'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import { notFound } from 'next/navigation'
import type { Locale } from '@/i18n/config'
import { setRequestLocale, getTranslations } from 'next-intl/server'

// IMPORTANT:
// This page must NOT connect to Postgres during `next build` (Docker image build),
// so we force dynamic rendering and do NOT use generateStaticParams().
export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{
    locale: string
    pageNumber: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { locale, pageNumber } = await paramsPromise
  setRequestLocale(locale)

  const t = await getTranslations('posts')
  const payload = await getPayload({ config: configPromise })

  const sanitizedPageNumber = Number(pageNumber)

  if (!Number.isInteger(sanitizedPageNumber)) notFound()

  const posts = await payload.find({
    collection: 'posts',
    depth: 1,
    limit: 12,
    locale: locale as Locale,
    page: sanitizedPageNumber,
    overrideAccess: false,
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>{t('title')}</h1>
        </div>
      </div>

      <div className="container mb-8">
        <PageRange
          collection="posts"
          currentPage={posts.page}
          limit={12}
          totalDocs={posts.totalDocs}
        />
      </div>

      <CollectionArchive posts={posts.docs} locale={locale as Locale} />

      <div className="container">
        {posts?.page && posts?.totalPages > 1 && (
          <Pagination page={posts.page} totalPages={posts.totalPages} />
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { locale, pageNumber } = await paramsPromise
  const t = await getTranslations({ locale, namespace: 'posts' })

  return {
    title: `${t('title')} - ${pageNumber}`,
  }
}
