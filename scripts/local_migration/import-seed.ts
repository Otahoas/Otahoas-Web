/**
 * Import seed data from seed-export.json (Pages and Media only)
 *
 * Run with:
 *   pnpm import:seed
 *
 * In Docker:
 *   docker compose exec dev npx tsx scripts/import-seed.ts
 */

import { getPayload } from 'payload'
import config from '../../src/payload.config'
import fs from 'fs'
import path from 'path'

const mediaFieldNames = new Set(['image', 'media', 'logo'])
const pageFieldNames = new Set(['linkedPage'])
const imageSources = ['public/Tilakuvat', 'public']

function findImagePath(filename: string): string | null {
  for (const source of imageSources) {
    const candidate = path.resolve(process.cwd(), source, filename)
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }
  return null
}

function remapRelationValue(
  value: any,
  relationTo: 'media' | 'pages',
  idMapping: Map<string, any>,
): any {
  if (value === null || value === undefined) return value

  if (Array.isArray(value)) {
    return value.map((item) => remapRelationValue(item, relationTo, idMapping))
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const newId = idMapping.get(`${relationTo}-${value}`)
    return newId ?? value
  }

  return remapIds(value, idMapping)
}

// Helper function to remap old IDs to new IDs in nested objects
function remapIds(obj: any, idMapping: Map<string, any>): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => remapIds(item, idMapping))
  }

  const result: any = {}
  for (const [key, value] of Object.entries(obj)) {
    // Skip id fields in nested objects
    if (key === 'id') {
      continue
    }

    if (mediaFieldNames.has(key)) {
      result[key] = remapRelationValue(value, 'media', idMapping)
      continue
    }

    if (pageFieldNames.has(key)) {
      result[key] = remapRelationValue(value, 'pages', idMapping)
      continue
    }

    // Remap reference values (e.g., { reference: { relationTo: 'pages', value: 27 } })
    if (key === 'reference' && value && typeof value === 'object') {
      const ref = value as any
      if (ref.relationTo && ref.value) {
        const newId = idMapping.get(`${ref.relationTo}-${ref.value}`)
        if (newId) {
          result[key] = { ...ref, value: newId }
          continue
        }
      }
    }

    result[key] = remapIds(value, idMapping)
  }
  return result
}

async function main() {
  console.log('📥 Importing seed data (Pages and Media)...')

  const payload = await getPayload({ config })

  // Read export file
  const exportPath = path.join(process.cwd(), 'data/seed-export.json')
  if (!fs.existsSync(exportPath)) {
    console.error('❌ seed-export.json not found. Run "pnpm export:seed" first.')
    process.exit(1)
  }

  const data = JSON.parse(fs.readFileSync(exportPath, 'utf-8'))

  // Track old ID -> new ID mapping
  const idMapping = new Map<string, any>()

  // Import media (non-localized) - match metadata with actual image files from sources
  const mediaData = data.media
  if (mediaData) {
    console.log(`  Importing media (searching: ${imageSources.join(', ')})...`)
    let imported = 0
    let skipped = 0

    for (const doc of mediaData) {
      try {
        const { id, updatedAt, createdAt, sizes, ...docData } = doc

        // Check if image file exists in any source (in order)
        const imagePath = findImagePath(docData.filename)
        if (!imagePath) {
          skipped++
          continue
        }

        // Read the image file
        const imageBuffer = fs.readFileSync(imagePath)

        // Upload image with metadata
        const created = await payload.create({
          collection: 'media',
          data: {
            alt: docData.alt,
            caption: docData.caption,
            // Don't include sizes - Payload will generate them
          },
          file: {
            name: docData.filename,
            data: imageBuffer,
            mimetype: docData.mimeType,
            size: imageBuffer.byteLength,
          },
          context: { disableRevalidate: true },
        })

        idMapping.set(`media-${id}`, created.id)
        imported++
        console.log(`    ✓ Uploaded media: ${docData.filename}`)
      } catch (error) {
        console.error(`    ✗ Failed to import media:`, (error as Error).message)
      }
    }

    console.log(`    📊 Media: ${imported} imported, ${skipped} skipped (not found in sources)`)
  }

  // Import pages (localized - fi and en)
  const pagesData = data.pages
  if (pagesData) {
    console.log(`  Importing pages...`)

    const createdPageIds = new Map()

    // Import Finnish locale first
    const fiPages = pagesData.fi || []
    for (const doc of fiPages) {
      try {
        const { id, updatedAt, createdAt, ...docData } = doc

        // Remap any page references in the content
        const remappedData = remapIds(docData, idMapping)

        const created = await payload.create({
          collection: 'pages',
          locale: 'fi',
          data: remappedData,
          context: { disableRevalidate: true },
        })

        createdPageIds.set(id, created.id)
        idMapping.set(`pages-${id}`, created.id)
        console.log(`    ✓ Created page (fi): ${docData.title || docData.slug || created.id}`)
      } catch (error) {
        console.error(`    ✗ Failed to import page (fi):`, (error as Error).message)
      }
    }

    // Update with English locale
    const enPages = pagesData.en || []
    for (const doc of enPages) {
      try {
        const { id, updatedAt, createdAt, ...docData } = doc

        const newId = createdPageIds.get(id)
        if (!newId) {
          console.warn(`    ⚠️  No Finnish page found for ID ${id}, skipping English update`)
          continue
        }

        // Remap any page references in the content
        const remappedData = remapIds(docData, idMapping)

        await payload.update({
          collection: 'pages',
          id: newId,
          locale: 'en',
          data: remappedData,
          context: { disableRevalidate: true },
        })

        console.log(`    ✓ Updated page (en): ${docData.title || docData.slug || newId}`)
      } catch (error) {
        console.error(`    ✗ Failed to update page (en):`, (error as Error).message)
      }
    }
  }

  console.log(`\n✅ Import complete!`)
  console.log(`📊 Pages and media imported successfully`)
  console.log(`\nNext steps:`)
  console.log(`  1. Restart the dev server: docker compose restart dev`)
  console.log(`  2. Visit http://localhost:3000 to verify`)
  console.log(`  3. Create a new admin user if needed`)

  process.exit(0)
}

main().catch((error) => {
  console.error('❌ Import failed:', error)
  process.exit(1)
})
