import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  return (
    /* eslint-disable @next/next/no-img-element */
    <>
      <img
        alt="OtaHoas"
        width={48}
        height={48}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className={clsx('h-12 w-12 object-contain dark:hidden', className)}
        src="/otahoas_light.png"
      />
      <img
        alt="OtaHoas"
        width={48}
        height={48}
        loading={loading}
        fetchPriority={priority}
        decoding="async"
        className={clsx('hidden h-12 w-12 object-contain dark:block', className)}
        src="/otahoas_dark.png"
      />
    </>
  )
}
