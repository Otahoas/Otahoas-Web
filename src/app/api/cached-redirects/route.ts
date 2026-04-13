import { getCachedRedirects } from '@/utilities/getRedirects'
import { NextResponse } from 'next/server'

export async function GET() {
  const redirects = await getCachedRedirects()()
  return NextResponse.json(redirects)
}
