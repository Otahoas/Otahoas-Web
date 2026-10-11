import type { Payload } from 'payload'

import type { ReservationTarget } from '@/payload-types'

type CategoryType = 'club-room' | 'workshop' | 'music-room' | 'storage' | 'equipment'

type SheetVenueKey = NonNullable<ReservationTarget['sheetVenueKey']>

/**
 * Forum topic ids are not in this file on purpose: they belong to a private
 * group and are set per deployment from the admin panel. The seed carries this
 * placeholder, and seeding never overwrites a topic that is already configured.
 */
const PLACEHOLDER_TOPIC_ID = '1'

interface ReservationTargetData {
  emailPrefix: string
  labelFi: string
  labelEn: string
  category: CategoryType
  sortOrder: number
  /** Placeholder only; the real topic is configured in the admin panel. */
  telegramTopicId: string
  googleCalendarId: string
  /** Exact value written to the reservation sheet, and shown in calendar titles. */
  sheetVenueKey: SheetVenueKey
}

export const reservationTargetsData: ReservationTargetData[] = [
  // Club Rooms
  {
    emailPrefix: 'jmt10cd',
    labelFi: 'JMT10CD-kerhohuone',
    labelEn: 'JMT10CD club room',
    category: 'club-room',
    sortOrder: 1,
    telegramTopicId: PLACEHOLDER_TOPIC_ID,
    googleCalendarId: 'u5fk2i4pnmt950t48lof3tnci8@group.calendar.google.com',
    sheetVenueKey: 'JMT 10 CD',
  },
  {
    emailPrefix: 'jmt10h',
    labelFi: 'JMT10H-kerhohuone',
    labelEn: 'JMT10H club room',
    category: 'club-room',
    sortOrder: 2,
    telegramTopicId: PLACEHOLDER_TOPIC_ID,
    googleCalendarId: 'mb3avdu3moht99lshaut39s4d0@group.calendar.google.com',
    sheetVenueKey: 'JMT 10 H',
  },
  {
    emailPrefix: 'jmt11ab',
    labelFi: 'JMT11AB-kerhohuone',
    labelEn: 'JMT11AB club room',
    category: 'club-room',
    sortOrder: 3,
    telegramTopicId: PLACEHOLDER_TOPIC_ID,
    googleCalendarId: '946mj42ahhaqjkqsglldnh268o@group.calendar.google.com',
    sheetVenueKey: 'JMT 11 AB',
  },
  {
    emailPrefix: 'jmt11cd',
    labelFi: 'JMT11CD-kerhohuone',
    labelEn: 'JMT11CD club room',
    category: 'club-room',
    sortOrder: 4,
    telegramTopicId: PLACEHOLDER_TOPIC_ID,
    googleCalendarId: 'rhebop45ar65somg6v8utf6is8@group.calendar.google.com',
    sheetVenueKey: 'JMT 11 CD',
  },
  {
    emailPrefix: 'smt3',
    labelFi: 'SMT3-kerhohuone',
    labelEn: 'SMT3 club room',
    category: 'club-room',
    sortOrder: 5,
    telegramTopicId: PLACEHOLDER_TOPIC_ID,
    googleCalendarId: '3q5ec5aquju8monmvjbtcjcgmk@group.calendar.google.com',
    sheetVenueKey: 'SMT 3 A',
  },
  {
    emailPrefix: 'sk5b',
    labelFi: 'SK5B-kerhohuone',
    labelEn: 'SK5B club room',
    category: 'club-room',
    sortOrder: 6,
    telegramTopicId: PLACEHOLDER_TOPIC_ID,
    googleCalendarId: 'ufa2akdfe8fta20ehvn9dl0gmg@group.calendar.google.com',
    sheetVenueKey: 'SK 5 B',
  },
  {
    emailPrefix: 'sk6d',
    labelFi: 'SK6D-kerhohuone',
    labelEn: 'SK6D club room',
    category: 'club-room',
    sortOrder: 7,
    telegramTopicId: PLACEHOLDER_TOPIC_ID,
    googleCalendarId: '7s5n3fu8u04p7vnqnt7f4i99l4@group.calendar.google.com',
    sheetVenueKey: 'SK 6 D',
  },

  // Workshops
  {
    emailPrefix: 'jmt11b_mekaniikka',
    labelFi: 'JMT11B-mekaniikkapaja',
    labelEn: 'JMT11B mechanics workshop',
    category: 'workshop',
    sortOrder: 10,
    telegramTopicId: PLACEHOLDER_TOPIC_ID,
    googleCalendarId: 'd8nbsluvjq5j7nr66am7eg3l3k@group.calendar.google.com',
    sheetVenueKey: 'JMT 11 B Mekaniikkapaja',
  },
  {
    emailPrefix: 'sk6c_puu',
    labelFi: 'SK6C-puutyöpaja',
    labelEn: 'SK6C wood workshop',
    category: 'workshop',
    sortOrder: 11,
    telegramTopicId: PLACEHOLDER_TOPIC_ID,
    googleCalendarId: 'fkjpivjehh6oa4s4t7rnmot0eo@group.calendar.google.com',
    sheetVenueKey: 'SK 6 C Puutyöpaja',
  },

  // Music Rooms
  {
    emailPrefix: 'jmt10d_soitto',
    labelFi: 'JMT10D-soittohuone',
    labelEn: 'JMT10D music room',
    category: 'music-room',
    sortOrder: 20,
    telegramTopicId: PLACEHOLDER_TOPIC_ID,
    googleCalendarId:
      '16035e34c19efa67fa66f1f8884457af8add5ccb39f2714790e3ad391af802ea@group.calendar.google.com',
    sheetVenueKey: 'JMT 10 D Soittohuone',
  },

  // Storage
  {
    emailPrefix: 'jmt11cd_varasto',
    labelFi: 'Muuttolaatikot / Muut tavarat',
    labelEn: 'Moving boxes / Other things',
    category: 'storage',
    sortOrder: 30,
    telegramTopicId: PLACEHOLDER_TOPIC_ID,
    googleCalendarId: 'icfq8vqs035esjag36lgacpsq8@group.calendar.google.com',
    sheetVenueKey: 'Lainatavarat',
  },

  // Equipment
  {
    emailPrefix: 'jmt11m_kontti',
    labelFi: 'Kajakit ja SUP-laudat',
    labelEn: 'Kayaks and SUP-boards',
    category: 'equipment',
    sortOrder: 40,
    telegramTopicId: PLACEHOLDER_TOPIC_ID,
    googleCalendarId: '035n3m3enug2agplmoe2vk0k9c@group.calendar.google.com',
    sheetVenueKey: 'Kajakit ja SUP-laudat',
  },
]

export const seedReservationTargets = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding reservation targets...')

  const existing = await payload.find({
    collection: 'reservation-targets',
    limit: 200,
  })

  const byPrefix = new Map(existing.docs.map((doc) => [doc.emailPrefix, doc]))

  for (const target of reservationTargetsData) {
    const current = byPrefix.get(target.emailPrefix)

    if (!current) {
      await payload.create({
        collection: 'reservation-targets',
        data: { ...target, active: true },
      })

      continue
    }

    // Labels and categories come from this file, but the Telegram topic and the
    // calendar are per-deployment settings a committee member filled in by hand.
    // Re-seeding must not throw those away, so anything already configured wins
    // over what the seed carries.
    await payload.update({
      collection: 'reservation-targets',
      id: current.id,
      data: {
        ...target,
        active: true,
        telegramTopicId:
          current.telegramTopicId && current.telegramTopicId !== PLACEHOLDER_TOPIC_ID
            ? current.telegramTopicId
            : target.telegramTopicId,
        googleCalendarId: current.googleCalendarId || target.googleCalendarId,
      },
    })
  }

  const known = new Set(reservationTargetsData.map((target) => target.emailPrefix))
  const stale = existing.docs.filter((doc) => !known.has(doc.emailPrefix))

  for (const doc of stale) {
    payload.logger.info(`Removing target no longer in the seed: ${doc.emailPrefix}`)

    await payload.delete({ collection: 'reservation-targets', id: doc.id })
  }

  payload.logger.info(`Seeded ${reservationTargetsData.length} reservation targets`)
}
