import { postgresAdapter } from '@payloadcms/db-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { ReservationTargets } from './collections/ReservationTargets'
import { AccessRequestSubmissions } from './collections/AccessRequestSubmissions'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import {
  accessRequestHandler,
  reservationTargetsHandler,
  reservationTargetCalendarsHandler,
} from './endpoints/accessRequest'
import { migrateOldSite } from './endpoints/seed/migrate-old-site'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  localization: {
    locales: [
      {
        label: 'Suomi',
        code: 'fi',
      },
      {
        label: 'English',
        code: 'en',
      },
    ],
    defaultLocale: 'fi',
    fallback: true,
  },
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    ReservationTargets,
    AccessRequestSubmissions,
  ],
  cors: [getServerSideURL(), 'https://otahoas.fi', 'https://www.otahoas.fi'].filter(Boolean),
  globals: [Header, Footer],
  plugins,
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  endpoints: [
    {
      path: '/access-request',
      method: 'post',
      handler: accessRequestHandler,
    },
    {
      path: '/reservation-targets',
      method: 'get',
      handler: reservationTargetsHandler,
    },
    {
      path: '/reservation-target-calendars',
      method: 'get',
      handler: reservationTargetCalendarsHandler,
    },
    {
      path: '/migrate-old-site',
      method: 'post',
      handler: async (req) => {
        // Only allow authenticated users
        if (!req.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }

        try {
          await migrateOldSite({ payload: req.payload, req })
          return Response.json({ success: true, message: 'Migration complete' })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          req.payload.logger.error(`Migration failed: ${message}`)
          return Response.json({ error: message }, { status: 500 })
        }
      },
    },
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        const secret = process.env.CRON_SECRET
        if (!secret) return false

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
