import type { GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'
import { locales } from '@/i18n/config'

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header`)

    // Revalidate all locale variants
    locales.forEach((locale) => {
      revalidateTag(`global_header_${locale}`)
    })
  }

  return doc
}
