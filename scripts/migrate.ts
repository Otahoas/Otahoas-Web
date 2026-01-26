/**
 * Migration script to import data from old OtaHoas site
 * Run with: npx tsx scripts/migrate.ts
 * Or: docker compose exec dev npx tsx scripts/migrate.ts
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'
import { migrateOldSite } from '../src/endpoints/seed/migrate-old-site'

async function main() {
  console.log('Starting migration...')

  const payload = await getPayload({ config })

  try {
    await migrateOldSite({
      payload,
      req: {} as any, // Mock request object
    })

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }

  process.exit(0)
}

main()
