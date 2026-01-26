import type { Payload, PayloadRequest } from 'payload'
import path from 'path'
import fs from 'fs'

// Use Docker path if running in container, otherwise use relative path
const OLD_SITE_PATH =
  process.env.OLD_SITE_PATH ||
  (fs.existsSync('/home/node/otahoas_vanha/public')
    ? '/home/node/otahoas_vanha/public'
    : path.resolve(process.cwd(), '../otahoas_vanha/public'))

// Content directory for translated content files
const CONTENT_PATH = path.resolve(process.cwd(), 'content')

// Category mapping based on email prefix patterns
const getCategoryFromPrefix = (
  prefix: string,
): 'club-room' | 'workshop' | 'music-room' | 'storage' | 'equipment' => {
  if (prefix.includes('mekaniikka') || prefix.includes('puu')) return 'workshop'
  if (prefix.includes('soitto')) return 'music-room'
  if (prefix.includes('varasto')) return 'storage'
  if (prefix.includes('kontti')) return 'equipment'
  return 'club-room'
}

// Seed reservation targets from listat.txt
export const seedReservationTargets = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding reservation targets from old site...')

  const listatPath = path.join(OLD_SITE_PATH, 'käyttöpyyntögeneraattori', 'listat.txt')

  if (!fs.existsSync(listatPath)) {
    payload.logger.error(`listat.txt not found at ${listatPath}`)
    return
  }

  const content = fs.readFileSync(listatPath, 'utf-8')
  const lines = content
    .trim()
    .split('\n')
    .filter((line) => line.trim())

  // Delete existing targets
  await payload.delete({
    collection: 'reservation-targets',
    where: {},
  })

  // Track unique prefixes to avoid duplicates (jmt11cd_varasto appears twice)
  const seenPrefixes = new Set<string>()
  let sortOrder = 1

  for (const line of lines) {
    const [emailPrefix, labelFi, labelEn] = line.split(';')

    if (!emailPrefix || !labelFi || !labelEn) continue

    // Skip duplicates (combine labels for same prefix)
    if (seenPrefixes.has(emailPrefix)) {
      payload.logger.info(`Skipping duplicate prefix: ${emailPrefix}`)
      continue
    }
    seenPrefixes.add(emailPrefix)

    const category = getCategoryFromPrefix(emailPrefix)

    await payload.create({
      collection: 'reservation-targets',
      data: {
        emailPrefix: emailPrefix.trim(),
        labelFi: labelFi.trim(),
        labelEn: labelEn.trim(),
        category,
        active: true,
        sortOrder: sortOrder++,
        telegramTopicId: '1', // Default - update in admin panel with actual topic ID
      },
    })

    payload.logger.info(`Created target: ${emailPrefix}`)
  }

  payload.logger.info(`Seeded ${seenPrefixes.size} reservation targets`)
}

// Convert plain text to Lexical rich text format
const textToLexical = (text: string) => {
  const paragraphs = text.split('\n\n')

  return {
    root: {
      type: 'root',
      children: paragraphs
        .map((para) => {
          const lines = para.split('\n')

          // Check if it's a numbered list
          const isNumberedList = lines.every(
            (line) => /^\d+\./.test(line.trim()) || line.trim() === '',
          )

          if (isNumberedList && lines.some((line) => /^\d+\./.test(line.trim()))) {
            return {
              type: 'list',
              listType: 'number',
              children: lines
                .filter((line) => /^\d+\./.test(line.trim()))
                .map((line) => ({
                  type: 'listitem',
                  children: [
                    {
                      type: 'paragraph',
                      children: [
                        {
                          type: 'text',
                          text: line.replace(/^\d+\.\s*/, '').trim(),
                        },
                      ],
                    },
                  ],
                })),
            }
          }

          // Check if it's a heading (short line, no punctuation at end)
          const isHeading = para.length < 80 && !para.endsWith('.') && !para.includes('\n')

          if (isHeading) {
            return {
              type: 'heading',
              tag: 'h2',
              children: [
                {
                  type: 'text',
                  text: para.trim(),
                },
              ],
            }
          }

          // Regular paragraph
          return {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: para.replace(/\n/g, ' ').trim(),
              },
            ],
          }
        })
        .filter((node) => {
          // Filter out empty paragraphs
          if (node.type === 'paragraph') {
            const first = node.children?.[0]
            const text =
              first &&
              typeof first === 'object' &&
              'text' in first &&
              typeof (first as any).text === 'string'
                ? (first as any).text
                : ''

            return text.trim().length > 0
          }
          return true
        }),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

// Seed content pages with proper localization
export const seedContentPages = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding content pages from old site...')

  // Read content files
  const saannotFi = fs.existsSync(path.join(OLD_SITE_PATH, 'saannot.txt'))
    ? fs.readFileSync(path.join(OLD_SITE_PATH, 'saannot.txt'), 'utf-8')
    : ''

  const rulesEn = fs.existsSync(path.join(OLD_SITE_PATH, 'rules.txt'))
    ? fs.readFileSync(path.join(OLD_SITE_PATH, 'rules.txt'), 'utf-8')
    : ''

  const avaimellisilleFi = fs.existsSync(path.join(OLD_SITE_PATH, 'avaimellisille.txt'))
    ? fs.readFileSync(path.join(OLD_SITE_PATH, 'avaimellisille.txt'), 'utf-8')
    : ''

  // Read English translation from content directory
  const avaimellisille_en = fs.existsSync(path.join(CONTENT_PATH, 'avaimellisille_en.txt'))
    ? fs.readFileSync(path.join(CONTENT_PATH, 'avaimellisille_en.txt'), 'utf-8')
    : avaimellisilleFi // Fallback to Finnish if no translation

  const tilat = fs.existsSync(path.join(OLD_SITE_PATH, 'tilat.txt'))
    ? fs.readFileSync(path.join(OLD_SITE_PATH, 'tilat.txt'), 'utf-8')
    : ''

  // Pages to create with localized content
  const localizedPages = [
    {
      slug: 'saannot',
      fi: { title: 'Säännöt', content: saannotFi },
      en: { title: 'Rules', content: rulesEn },
    },
    {
      slug: 'avaimellisille',
      fi: { title: 'Avaimellisille', content: avaimellisilleFi },
      en: { title: 'For Key Holders', content: avaimellisille_en },
    },
    {
      slug: 'tilat',
      fi: { title: 'Tilat', content: tilat },
      en: { title: 'Spaces', content: tilat }, // Same content, different title
    },
    {
      slug: 'kayttopyynto',
      fi: {
        title: 'Käyttöpyyntö',
        blocks: [
          {
            blockType: 'accessRequestForm',
            language: 'fi',
            rulesPageLink: '/saannot',
            calendarLink: '/kalenteri',
          },
        ],
      },
      en: {
        title: 'Access Request',
        blocks: [
          {
            blockType: 'accessRequestForm',
            language: 'en',
            rulesPageLink: '/saannot',
            calendarLink: '/kalenteri',
          },
        ],
      },
    },
    {
      slug: 'kalenteri',
      fi: {
        title: 'Kalenteri',
        blocks: [
          {
            blockType: 'calendarEmbed',
            title: 'OtaHoas Kalenteri',
            language: 'fi',
            height: 600,
            calendarUrl: 'https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID',
          },
        ],
      },
      en: {
        title: 'Calendar',
        blocks: [
          {
            blockType: 'calendarEmbed',
            title: 'OtaHoas Calendar',
            language: 'en',
            height: 600,
            calendarUrl: 'https://calendar.google.com/calendar/embed?src=YOUR_CALENDAR_ID',
          },
        ],
      },
    },
  ]

  for (const pageData of localizedPages) {
    // Check if page already exists
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: pageData.slug } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      payload.logger.info(`Page ${pageData.slug} already exists, skipping...`)
      continue
    }

    // Build Finnish layout
    const layoutFi: any[] = []
    if (pageData.fi.content) {
      layoutFi.push({
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: textToLexical(pageData.fi.content),
          },
        ],
      })
    }
    if (pageData.fi.blocks) {
      layoutFi.push(...pageData.fi.blocks)
    }

    // Create page with Finnish content first (default locale)
    // Create page with Finnish content first (default locale)
    const createdPage = await payload.create({
      collection: 'pages',
      locale: 'fi',
      draft: false,
      data: {
        title: pageData.fi.title,
        slug: pageData.slug,
        layout: layoutFi,
        _status: 'published',
        hero: {} as any,
      } as any,
      context: { disableRevalidate: true },
    })

    // Build English layout
    const layoutEn: any[] = []
    if (pageData.en.content) {
      layoutEn.push({
        blockType: 'content',
        columns: [
          {
            size: 'full',
            richText: textToLexical(pageData.en.content),
          },
        ],
      })
    }
    if (pageData.en.blocks) {
      layoutEn.push(...pageData.en.blocks)
    }

    // Update with English content
    await payload.update({
      collection: 'pages',
      id: createdPage.id,
      locale: 'en',
      data: {
        title: pageData.en.title,
        layout: layoutEn,
      },
      context: {
        disableRevalidate: true,
      },
    })

    payload.logger.info(
      `Created localized page: ${pageData.slug} (fi: ${pageData.fi.title}, en: ${pageData.en.title})`,
    )
  }

  payload.logger.info('Finished seeding content pages')
}

// Main migration function
export const migrateOldSite = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Starting migration from old OtaHoas site...')
  payload.logger.info(`Looking for old site at: ${OLD_SITE_PATH}`)

  if (!fs.existsSync(OLD_SITE_PATH)) {
    throw new Error(`Old site not found at ${OLD_SITE_PATH}`)
  }

  await seedReservationTargets(payload)
  await seedContentPages(payload)

  payload.logger.info('Migration complete!')
}
