'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

import { Media } from '@/components/Media'
import type { Media as MediaType, Post } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'

type PostItem = Pick<Post, 'id' | 'slug' | 'title' | 'heroImage' | 'meta' | 'publishedAt'>

type PostsCarouselClientProps = {
  posts: PostItem[]
  title?: string | null
}

const getVisibleCount = (windowWidth: number): 1 | 2 | 3 => {
  if (windowWidth < 640) return 1
  if (windowWidth < 1024) return 2
  return 3
}

export const PostsCarouselClient: React.FC<PostsCarouselClientProps> = ({ posts, title }) => {
  const locale = useLocale()
  const [startIndex, setStartIndex] = useState(0)
  const [visibleCount, setVisibleCount] = useState<1 | 2 | 3>(3)

  useEffect(() => {
    const onResize = () => setVisibleCount(getVisibleCount(window.innerWidth))

    onResize()
    window.addEventListener('resize', onResize)

    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    setStartIndex((prev) => {
      const maxStart = Math.max(0, posts.length - visibleCount)
      return Math.min(prev, maxStart)
    })
  }, [visibleCount, posts.length])

  const visiblePosts = useMemo(
    () => posts.slice(startIndex, startIndex + visibleCount),
    [posts, startIndex, visibleCount],
  )

  const canShowOlder = startIndex + visibleCount < posts.length
  const canShowNewer = startIndex > 0

  const goOlder = () => {
    setStartIndex((prev) => Math.min(prev + visibleCount, Math.max(0, posts.length - visibleCount)))
  }

  const goNewer = () => {
    setStartIndex((prev) => Math.max(prev - visibleCount, 0))
  }

  const gridColsClass =
    visibleCount === 1 ? 'grid-cols-1' : visibleCount === 2 ? 'grid-cols-2' : 'grid-cols-3'

  return (
    <div className="container my-16">
      <div className="rounded-lg bg-[rgb(249,109,82)] p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          {title ? <h2 className="text-4xl font-semibold">{title}</h2> : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goNewer}
              disabled={!canShowNewer}
              className="rounded-md border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Show newer posts"
            >
              ← Newer
            </button>
            <button
              type="button"
              onClick={goOlder}
              disabled={!canShowOlder}
              className="rounded-md border border-border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Show older posts"
            >
              Older →
            </button>
          </div>
        </div>

        <div className={`grid gap-6 ${gridColsClass}`}>
          {visiblePosts.map((post) => {
            const image = post.heroImage ?? post.meta?.image
            const href = `/${locale}/posts/${post.slug}`

            return (
              <article
                key={post.id}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <Link href={href} className="block">
                  <div className="aspect-video w-full overflow-hidden">
                    {image && typeof image === 'object' ? (
                      <Media
                        resource={image as MediaType}
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold leading-snug">
                      {post.title || 'Untitled post'}
                    </h3>
                    {post.publishedAt && (
                      <time
                        dateTime={post.publishedAt}
                        className="mt-2 block text-sm text-muted-foreground"
                      >
                        {formatDateTime(post.publishedAt)}
                      </time>
                    )}
                  </div>
                </Link>
              </article>
            )
          })}
        </div>

        <div className="h-10" />
      </div>
    </div>
  )
}
