'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

import { Media } from '@/components/Media'
import type { Media as MediaType, Post } from '@/payload-types'
import { formatDateTime } from '@/utilities/formatDateTime'

type PostItem = Pick<
  Post,
  'id' | 'slug' | 'title' | 'heroImage' | 'heroImageDark' | 'meta' | 'publishedAt'
>

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

  const maxStart = Math.max(0, posts.length - visibleCount)
  const clampedStart = Math.min(startIndex, maxStart)

  const visiblePosts = useMemo(
    () => posts.slice(clampedStart, clampedStart + visibleCount),
    [posts, clampedStart, visibleCount],
  )

  const canShowOlder = clampedStart + visibleCount < posts.length
  const canShowNewer = clampedStart > 0
  const showPagination = posts.length > visibleCount

  const goOlder = () => {
    setStartIndex(Math.min(clampedStart + visibleCount, maxStart))
  }

  const goNewer = () => {
    setStartIndex(Math.max(clampedStart - visibleCount, 0))
  }

  const gridColsClass =
    visibleCount === 1 ? 'grid-cols-1' : visibleCount === 2 ? 'grid-cols-2' : 'grid-cols-3'

  const getObjectPosition = (image: MediaType | null | undefined) => {
    if (!image || typeof image !== 'object') return undefined

    const focalX = typeof image.focalX === 'number' ? image.focalX : 50
    const focalY = typeof image.focalY === 'number' ? image.focalY : 50

    return { objectPosition: `${focalX}% ${focalY}%` }
  }

  const isMediaImage = (image: unknown): image is MediaType => {
    return Boolean(image && typeof image === 'object')
  }

  return (
    <div className="container my-16">
      <div className="rounded-lg bg-[rgb(249,109,82)] p-6 dark:bg-[rgb(84,7,5)]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {title ? <h2 className="text-4xl font-semibold">{title}</h2> : null}

          {showPagination && (
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
          )}
        </div>

        <div className={`grid gap-6 ${gridColsClass}`}>
          {visiblePosts.map((post) => {
            const lightImage = post.heroImage ?? post.meta?.image
            const darkImage = post.heroImageDark
            const href = `/${locale}/posts/${post.slug}`
            const hasBoth = isMediaImage(lightImage) && isMediaImage(darkImage)
            const fallbackImage = isMediaImage(lightImage)
              ? lightImage
              : isMediaImage(darkImage)
                ? darkImage
                : null
            const lightImageStyle = isMediaImage(lightImage)
              ? getObjectPosition(lightImage)
              : undefined
            const darkImageStyle = isMediaImage(darkImage)
              ? getObjectPosition(darkImage)
              : undefined

            return (
              <article
                key={post.id}
                className="overflow-hidden rounded-lg border border-border bg-card"
              >
                <Link href={href} className="block">
                  <div className="aspect-video w-full overflow-hidden">
                    {hasBoth ? (
                      <>
                        <Media
                          resource={lightImage}
                          className="h-full w-full dark:hidden"
                          imgClassName="h-full w-full object-cover"
                          style={lightImageStyle}
                        />
                        <Media
                          resource={darkImage}
                          className="hidden h-full w-full dark:block"
                          imgClassName="h-full w-full object-cover"
                          style={darkImageStyle}
                        />
                      </>
                    ) : fallbackImage ? (
                      <Media
                        resource={fallbackImage}
                        className="h-full w-full"
                        imgClassName="h-full w-full object-cover"
                        style={getObjectPosition(fallbackImage)}
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
