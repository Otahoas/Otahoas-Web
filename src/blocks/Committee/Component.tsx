import React from 'react'
import Image from 'next/image'

import type { CommitteeBlock as CommitteeBlockProps, Media } from '@/payload-types'

export const CommitteeBlock: React.FC<CommitteeBlockProps> = (props) => {
  const { title, description, members, email } = props

  return (
    <div className="container my-16">
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>
        )}
        {email && (
          <div className="flex justify-center mb-4">
            <div className="inline-flex flex-col gap-2 px-5 py-3 rounded-lg bg-[rgb(249,109,82)] dark:bg-[rgb(84,7,5)] text-white">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${email}`} className="text-sm font-medium hover:underline underline-offset-4">
                  {email}
                </a>
              </div>
            </div>
          </div>
        )}
        {description && (
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            {description}
          </p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members?.map((member, index) => {
            const image = member.image as Media | null

            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-[rgb(249,109,82)] dark:bg-[rgb(84,7,5)] text-white dark:text-foreground"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted mb-3 flex items-center justify-center">
                  {image?.url ? (
                    <Image
                      src={image.url}
                      alt={member.name}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <svg
                      className="w-12 h-12 text-muted-foreground"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                <h3 className="font-semibold">
                  {member.name}
                </h3>
                {member.title && (
                  <p className="text-sm text-white/70 dark:text-muted-foreground">
                    {member.title}
                  </p>
                )}
                {member.telegram && (
                  <a
                    href={`https://t.me/${member.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/70 hover:text-white dark:text-foreground/60 dark:hover:text-foreground"
                  >
                    @{member.telegram}
                  </a>
                )}
              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}
