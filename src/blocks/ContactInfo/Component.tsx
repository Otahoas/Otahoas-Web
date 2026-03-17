import React from 'react'

import type { ContactInfoBlock as ContactInfoBlockProps } from '@/payload-types'

const EmailIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

const TelegramIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
)

const WebsiteIcon = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"
    />
  </svg>
)

const icons: Record<string, React.FC> = {
  email: EmailIcon,
  telegram: TelegramIcon,
  website: WebsiteIcon,
}

function resolveHref(type: string, url: string) {
  if (type === 'email' && !url.startsWith('mailto:')) return `mailto:${url}`
  return url
}

export const ContactInfoBlock: React.FC<ContactInfoBlockProps> = (props) => {
  const { title, links } = props

  if (!links || links.length === 0) return null

  return (
    <div className="container my-16">
      <div className="mx-auto max-w-4xl">
        {title && <h2 className="mb-4 text-center text-3xl font-bold">{title}</h2>}
        <div className="flex justify-center">
          <div className="inline-flex flex-col gap-2 rounded-lg bg-[rgb(249,109,82)] px-5 py-3 text-white dark:bg-[rgb(84,7,5)]">
            {links.map((link, index) => {
              const Icon = icons[link.type] ?? WebsiteIcon
              const href = resolveHref(link.type, link.url)
              return (
                <div key={index} className="flex items-center gap-3">
                  <Icon />
                  <a
                    href={href}
                    target={link.type !== 'email' ? '_blank' : undefined}
                    rel={link.type !== 'email' ? 'noopener noreferrer' : undefined}
                    className="text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
