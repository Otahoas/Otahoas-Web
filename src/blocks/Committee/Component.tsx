import React from 'react'
import Image from 'next/image'
import { cn } from '@/utilities/ui'

import type { CommitteeBlock as CommitteeBlockProps, Media } from '@/payload-types'

export const CommitteeBlock: React.FC<CommitteeBlockProps> = (props) => {
  const { title, description, members, email } = props

  return (
    <div className="container my-16">
      <div className="mx-auto max-w-5xl">
        {title && <h2 className="mb-3 text-center text-3xl font-bold">{title}</h2>}
        {email && (
          <div className="mb-4 flex justify-center">
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 rounded-full bg-[rgb(249,109,82)] px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-[rgb(84,7,5)]"
            >
              <svg
                className="h-4 w-4 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              {email}
            </a>
          </div>
        )}
        {description && (
          <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">{description}</p>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {members?.map((member, index) => {
            const image = member.image as Media | null
            const imageDark = member.imageDark as Media | null
            const hasBoth = image?.url && imageDark?.url
            const anyImage = image?.url || imageDark?.url

            return (
              <div
                key={index}
                className="group overflow-hidden rounded-xl bg-[rgb(249,109,82)] text-white shadow-md transition-shadow hover:shadow-lg dark:bg-[rgb(84,7,5)] dark:text-foreground"
              >
                {/* Image area */}
                <div className="relative aspect-square w-full overflow-hidden bg-black/10">
                  {anyImage ? (
                    <>
                      {image?.url && (
                        <Image
                          src={image.url}
                          alt={member.name}
                          fill
                          className={cn(
                            'object-cover transition-transform duration-300 group-hover:scale-105',
                            hasBoth && 'dark:hidden',
                          )}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      )}
                      {imageDark?.url && (
                        <Image
                          src={imageDark.url}
                          alt={member.name}
                          fill
                          className={cn(
                            'object-cover transition-transform duration-300 group-hover:scale-105',
                            hasBoth && 'hidden dark:block',
                          )}
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      )}
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <svg
                        className="h-20 w-20 text-white/30"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Text area */}
                <div className="p-3">
                  <h3 className="font-semibold leading-tight">{member.name}</h3>
                  {member.title && (
                    <p className="mt-0.5 text-sm text-white/70 dark:text-muted-foreground">
                      {member.title}
                    </p>
                  )}
                  {member.telegram && (
                    <a
                      href={`https://t.me/${member.telegram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-white/60 transition-colors hover:text-white dark:text-foreground/50 dark:hover:text-foreground"
                    >
                      @{member.telegram}
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
