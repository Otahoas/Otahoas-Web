/**
 * Export Current Database State to JSON
 *
 * Run with:
 *   pnpm export:seed
 *
 * In Docker:
 *   docker compose exec dev pnpm export:seed
 *
 * Creates: data/seed-export.json with all collections
 */

import { getPayload } from 'payload'
import config from '../../src/payload.config'
import fs from 'fs'
import path from 'path'

async function main() {
  console.log('📥 Exporting current database state...')

  const payload = await getPayload({ config })

  const exportData: Record<string, any> = {}

  // Collections to export
  const localizedCollections = ['pages']

  const nonLocalizedCollections = ['media']

  // Export each locale separately for localized collections
  const locales = ['fi', 'en']

  for (const collection of localizedCollections) {
    try {
      console.log(`  Exporting ${collection}...`)

      // Export for each locale
      const localeData: Record<string, any[]> = {}

      for (const locale of locales) {
        const { docs } = await payload.find({
          collection: collection as any,
          locale: locale as any,
          limit: 1000,
          depth: 0, // Get raw IDs for references, not populated docs
        })
        localeData[locale] = docs
      }

      exportData[collection] = localeData

      const totalDocs = Object.values(localeData).reduce((sum, docs) => sum + docs.length, 0)
      console.log(`    ✓ ${totalDocs} documents (across locales)`)
    } catch (error) {
      console.warn(`    ⚠ Could not export ${collection}:`, (error as Error).message)
    }
  }

  // Export non-localized collections (single locale only)
  for (const collection of nonLocalizedCollections) {
    try {
      console.log(`  Exporting ${collection}...`)

      const { docs } = await payload.find({
        collection: collection as any,
        limit: 1000,
        depth: 0,
      })

      exportData[collection] = docs
      console.log(`    ✓ ${docs.length} documents`)
    } catch (error) {
      console.warn(`    ⚠ Could not export ${collection}:`, (error as Error).message)
    }
  }

  // Export globals (Header, Footer)
  // Globals now have shared navItems with localized labels
  // We need to fetch both locales and merge the localized fields
  const globals = ['header', 'footer']

  for (const globalSlug of globals) {
    try {
      console.log(`  Exporting global: ${globalSlug}...`)

      // Fetch both locales
      const fiDoc = await payload.findGlobal({
        slug: globalSlug as any,
        locale: 'fi',
        depth: 0,
      })

      const enDoc = await payload.findGlobal({
        slug: globalSlug as any,
        locale: 'en',
        depth: 0,
      })

      // Merge localized fields
      const mergedGlobal: any = {}

      for (const [key, value] of Object.entries(fiDoc)) {
        if (key === 'id' || key === 'updatedAt' || key === 'createdAt' || key === 'globalType') {
          continue // Skip metadata
        }

        if (key === 'navItems' && Array.isArray(value)) {
          // Merge navItems with localized labels
          const fiNavItems = value
          const enNavItems = (enDoc as any).navItems || []

          mergedGlobal.navItems = fiNavItems.map((fiItem: any, index: number) => {
            const enItem = enNavItems[index]

            return {
              id: fiItem.id,
              link: {
                type: fiItem.link.type,
                newTab: fiItem.link.newTab,
                reference: fiItem.link.reference,
                url: fiItem.link.url,
                label: {
                  fi: fiItem.link.label,
                  en: enItem?.link?.label || fiItem.link.label,
                },
              },
            }
          })
        } else if (key === 'siteTitle') {
          // siteTitle is localized
          mergedGlobal.siteTitle = {
            fi: fiDoc.siteTitle,
            en: (enDoc as any).siteTitle,
          }
        } else {
          // Non-localized fields
          mergedGlobal[key] = value
        }
      }

      exportData[`global_${globalSlug}`] = mergedGlobal
      console.log(`    ✓ Exported ${globalSlug}`)
    } catch (error) {
      console.warn(`    ⚠ Could not export ${globalSlug}:`, (error as Error).message)
    }
  }

  // Create data directory if it doesn't exist
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // Write to file
  const outputPath = path.join(dataDir, 'seed-export.json')
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2))

  console.log(`\n✅ Export complete!`)
  console.log(`📄 Saved to: ${outputPath}`)
  console.log(`📊 Localized collections: ${localizedCollections.length}`)
  console.log(`📊 Non-localized collections: ${nonLocalizedCollections.length}`)
  console.log(`\nYou can now:`)
  console.log(`  1. Commit this file to version control`)
  console.log(`  2. Use it to seed other environments`)
  console.log(`  3. Replace the baked-in data in seed.ts`)

  process.exit(0)
}

main().catch((error) => {
  console.error('❌ Export failed:', error)
  process.exit(1)
})
