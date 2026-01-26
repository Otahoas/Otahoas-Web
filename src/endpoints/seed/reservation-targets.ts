import type { Payload } from 'payload'

type CategoryType = 'club-room' | 'workshop' | 'music-room' | 'storage' | 'equipment'

interface ReservationTargetData {
  emailPrefix: string
  labelFi: string
  labelEn: string
  category: CategoryType
  sortOrder: number
}

export const reservationTargetsData: ReservationTargetData[] = [
  // Club Rooms
  {
    emailPrefix: 'jmt10cd',
    labelFi: 'JMT10CD-kerhohuone',
    labelEn: 'JMT10CD club room',
    category: 'club-room',
    sortOrder: 1,
  },
  {
    emailPrefix: 'jmt10h',
    labelFi: 'JMT10H-kerhohuone',
    labelEn: 'JMT10H club room',
    category: 'club-room',
    sortOrder: 2,
  },
  {
    emailPrefix: 'jmt11ab',
    labelFi: 'JMT11AB-kerhohuone',
    labelEn: 'JMT11AB club room',
    category: 'club-room',
    sortOrder: 3,
  },
  {
    emailPrefix: 'jmt11cd',
    labelFi: 'JMT11CD-kerhohuone',
    labelEn: 'JMT11CD club room',
    category: 'club-room',
    sortOrder: 4,
  },
  {
    emailPrefix: 'smt3',
    labelFi: 'SMT3-kerhohuone',
    labelEn: 'SMT3 club room',
    category: 'club-room',
    sortOrder: 5,
  },
  {
    emailPrefix: 'sk5b',
    labelFi: 'SK5B-kerhohuone',
    labelEn: 'SK5B club room',
    category: 'club-room',
    sortOrder: 6,
  },
  {
    emailPrefix: 'sk6d',
    labelFi: 'SK6D-kerhohuone',
    labelEn: 'SK6D club room',
    category: 'club-room',
    sortOrder: 7,
  },

  // Workshops
  {
    emailPrefix: 'jmt11b_mekaniikka',
    labelFi: 'JMT11B-mekaniikkapaja',
    labelEn: 'JMT11B mechanics workshop',
    category: 'workshop',
    sortOrder: 10,
  },
  {
    emailPrefix: 'sk6c_puu',
    labelFi: 'SK6C-puutyöpaja',
    labelEn: 'SK6C wood workshop',
    category: 'workshop',
    sortOrder: 11,
  },

  // Music Rooms
  {
    emailPrefix: 'jmt10d_soitto',
    labelFi: 'JMT10D-soittohuone',
    labelEn: 'JMT10D music room',
    category: 'music-room',
    sortOrder: 20,
  },

  // Storage
  {
    emailPrefix: 'jmt11cd_varasto',
    labelFi: 'Muuttolaatikot / Muut tavarat',
    labelEn: 'Moving boxes / Other things',
    category: 'storage',
    sortOrder: 30,
  },

  // Equipment
  {
    emailPrefix: 'jmt11m_kontti',
    labelFi: 'Kajakit ja SUP-laudat',
    labelEn: 'Kayaks and SUP-boards',
    category: 'equipment',
    sortOrder: 40,
  },
]

export const seedReservationTargets = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding reservation targets...')

  // Delete existing targets
  await payload.delete({
    collection: 'reservation-targets',
    where: {},
  })

  // Create new targets
  for (const target of reservationTargetsData) {
    await payload.create({
      collection: 'reservation-targets',
      data: {
        ...target,
        active: true,
      },
    })
  }

  payload.logger.info(`Seeded ${reservationTargetsData.length} reservation targets`)
}
