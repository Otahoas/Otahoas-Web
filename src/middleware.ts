import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './i18n/config'
import { type NextRequest, NextResponse } from 'next/server'

const internalOrigin = process.env.INTERNAL_SERVER_URL || 'http://localhost:3000'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Check Payload redirects before locale routing so redirect paths
  // are never locale-prefixed.
  try {
    const res = await fetch(new URL('/api/cached-redirects', internalOrigin), {
      next: { tags: ['redirects'] },
    })
    if (res.ok) {
      const redirects: { from: string; to?: { url?: string } }[] = await res.json()
      const match = redirects.find((r) => r.from === pathname)
      if (match?.to?.url) {
        return NextResponse.redirect(match.to.url)
      }
    }
  } catch {
    // If the fetch fails, fall through to normal routing
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api, /admin, /_next, /_vercel, /next, /media, static files
    '/((?!api|admin|_next|_vercel|next|media|.*\\..*).*)',
  ],
}
