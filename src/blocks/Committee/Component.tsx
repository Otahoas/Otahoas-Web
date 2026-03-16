import React from 'react'
import Image from 'next/image'

import type { CommitteeBlock as CommitteeBlockProps, Media } from '@/payload-types'

export const CommitteeBlock: React.FC<CommitteeBlockProps> = (props) => {
  const { title, description, members, email, telegramChannels } = props

  return (
    <div className="container my-16">
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>
        )}
        {(email || (telegramChannels && telegramChannels.length > 0)) && (
          <div className="flex justify-center mb-4">
            <div className="inline-flex flex-col gap-2 px-5 py-3 rounded-lg bg-[rgb(249,109,82)] dark:bg-[rgb(84,7,5)] text-white">
              {email && (
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${email}`} className="text-sm font-medium hover:underline underline-offset-4">
                    {email}
                  </a>
                </div>
              )}
              {telegramChannels?.map((channel, index) => (
                <div key={index} className="flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  {channel.url ? (
                    <a href={channel.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium hover:underline underline-offset-4">
                      {channel.name}
                    </a>
                  ) : (
                    <span className="text-sm font-medium">{channel.name}</span>
                  )}
                </div>
              ))}
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
