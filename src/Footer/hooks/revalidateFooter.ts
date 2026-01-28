import type { GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'
import { locales } from '@/i18n/config'

export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating footer`)

    // Revalidate all locale variants
    locales.forEach((locale) => {
      revalidateTag(`global_footer_${locale}`)
    })
  }

  return doc
}
