/**
 * Database Reset Script
 *
 * Run with:
 *   pnpm db:reset pages              - Delete pages and dependents
 *   pnpm db:reset media              - Delete media
 *   pnpm db:reset pages media        - Delete both
 *
 * In Docker:
 *   docker compose exec dev pnpm db:reset [pages|media]
 */

import { getPayload } from 'payload'
import config from '../../src/payload.config'

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('❌ No arguments provided')
    console.log('Usage: pnpm db:reset [pages|media]')
    process.exit(1)
  }

  const wipePages = args.includes('pages')
  const wipeMedia = args.includes('media')

  if (!wipePages && !wipeMedia) {
    console.log('❌ Invalid arguments. Use: pages, media, or both')
    process.exit(1)
  }

  console.log('🗑️  Resetting database...')

  const payload = await getPayload({ config })

  const collections: string[] = []

  if (wipePages) {
    collections.push('pages')
  }

  if (wipeMedia) {
    collections.push('media')
  }

  console.log(
    `\n📋 Deleting: ${wipePages ? 'pages' : ''}${wipePages && wipeMedia ? ', ' : ''}${wipeMedia ? 'media' : ''}\n`,
  )

  for (const collection of collections) {
    try {
      await payload.delete({
        collection: collection as any,
        where: {},
      })
      console.log(`   ✓ Cleared ${collection}`)
    } catch (error) {
      console.log(`   ⚠️  ${collection}: ${(error as Error).message}`)
    }
  }

  console.log('\n   ✅ Database cleaned')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Reset failed:', error)
    process.exit(1)
  })
