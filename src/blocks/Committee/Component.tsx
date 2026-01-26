import React from 'react'
import Image from 'next/image'

import type { CommitteeBlock as CommitteeBlockProps, Media } from '@/payload-types'

export const CommitteeBlock: React.FC<CommitteeBlockProps> = (props) => {
  const { title, description, members } = props

  return (
    <div className="container my-16">
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 className="text-3xl font-bold text-center mb-4">{title}</h2>
        )}
        {description && (
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {description}
          </p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {members?.map((member, index) => {
            const image = member.image as Media | null

            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mb-3 flex items-center justify-center">
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
                      className="w-12 h-12 text-gray-400 dark:text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {member.name}
                </h3>
                {member.title && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {member.title}
                  </p>
                )}
                {member.telegram && (
                  <a
                    href={`https://t.me/${member.telegram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
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
