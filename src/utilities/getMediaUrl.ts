/**
 * Processes media resource URL to ensure proper formatting.
 * Strips the server origin from absolute same-origin URLs so that Next.js image
 * optimization fetches the file locally instead of making an outbound HTTPS request
 * (which fails inside Docker where the public domain isn't reachable on port 443).
 */
export const getMediaUrl = (url: string | null | undefined, cacheTag?: string | null): string => {
  if (!url) return ''

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  // Strip own-origin prefix so the path is relative (e.g. /api/media/file/foo.jpg)
  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL
  if (serverURL && url.startsWith(serverURL)) {
    url = url.slice(serverURL.length)
  }

  return cacheTag ? `${url}?${cacheTag}` : url
}
