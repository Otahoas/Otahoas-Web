/**
 * Fix localization - combine separate Finnish/English pages into localized pages
 * Run with: docker compose exec dev pnpm tsx scripts/fix-localization.ts
 */

import { getPayload } from 'payload'
import config from '../src/payload.config'

async function main() {
  console.log('Fixing localization...')

  const payload = await getPayload({ config })

  try {
    // 1. Update pages with English titles
    const pagesToUpdate = [
      { slug: 'saannot', titleEn: 'Rules' },
      { slug: 'kayttopyynto', titleEn: 'Access Request' },
      { slug: 'avaimellisille', titleEn: 'For Key Holders' },
      { slug: 'tilat', titleEn: 'Spaces' },
      { slug: 'kalenteri', titleEn: 'Calendar' },
      { slug: 'home', titleEn: 'OtaHoas' },
    ]

    for (const { slug, titleEn } of pagesToUpdate) {
      const page = await payload.find({
        collection: 'pages',
        where: { slug: { equals: slug } },
        limit: 1,
      })

      if (page.docs.length > 0) {
        await payload.update({
          collection: 'pages',
          id: page.docs[0].id,
          locale: 'en',
          data: {
            title: titleEn,
          },
          context: { disableRevalidate: true },
        })
        console.log(`Updated ${slug} with English title: ${titleEn}`)
      }
    }

    // 2. Delete separate English pages if they exist
    const pagesToDelete = ['rules', 'access-request']

    for (const slug of pagesToDelete) {
      const page = await payload.find({
        collection: 'pages',
        where: { slug: { equals: slug } },
        limit: 1,
      })

      if (page.docs.length > 0) {
        await payload.delete({
          collection: 'pages',
          id: page.docs[0].id,
          context: { disableRevalidate: true },
        })
        console.log(`Deleted separate ${slug} page`)
      }
    }

    // 3. Set up header navigation with URL links
    console.log('Setting up header navigation...')

    const navItems = [
      { link: { type: 'custom' as const, label: 'Tilat', url: '/tilat', newTab: false } },
      { link: { type: 'custom' as const, label: 'Säännöt', url: '/saannot', newTab: false } },
      { link: { type: 'custom' as const, label: 'Käyttöpyyntö', url: '/kayttopyynto', newTab: false } },
      { link: { type: 'custom' as const, label: 'Avaimellisille', url: '/avaimellisille', newTab: false } },
    ]

    await payload.updateGlobal({
      slug: 'header',
      data: { navItems },
      context: { disableRevalidate: true },
    })

    console.log('Header navigation updated')

    // Also update with English labels
    await payload.updateGlobal({
      slug: 'header',
      locale: 'en',
      data: {
        navItems: [
          { link: { type: 'custom', label: 'Spaces', url: '/tilat', newTab: false } },
          { link: { type: 'custom', label: 'Rules', url: '/saannot', newTab: false } },
          { link: { type: 'custom', label: 'Access Request', url: '/kayttopyynto', newTab: false } },
          { link: { type: 'custom', label: 'For Key Holders', url: '/avaimellisille', newTab: false } },
        ],
      },
      context: { disableRevalidate: true },
    })

    console.log('Header navigation updated with English labels')

    // 4. Set up footer
    await payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          { link: { type: 'custom', label: 'Admin', url: '/admin', newTab: false } },
        ],
      },
      context: { disableRevalidate: true },
    })

    console.log('Footer updated')
    console.log('Done!')

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }

  process.exit(0)
}

main()
