import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api, /admin, /_next, /_vercel, /media, static files
    '/((?!api|admin|_next|_vercel|media|.*\\..*).*)',
  ],
}
