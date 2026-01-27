import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const getDefaultOpenGraph = (description?: string) => ({
  type: 'website' as const,
  description: description || 'OtaHoas',
  images: [
    {
      url: `${getServerSideURL()}/otahoas.png`,
    },
  ],
  siteName: 'OtaHoas',
  title: 'OtaHoas',
})

export const mergeOpenGraph = (og?: Metadata['openGraph'], description?: string): Metadata['openGraph'] => {
  const defaultOpenGraph = getDefaultOpenGraph(description)
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ?? defaultOpenGraph.images,
  }
}
