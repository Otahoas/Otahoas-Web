import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
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
import { ReservationSettings } from './globals/ReservationSettings/config'
import { ReservationEmails } from './globals/ReservationEmails/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import {
  accessRequestHandler,
  reservationTargetsHandler,
  reservationTargetCalendarsHandler,
} from './endpoints/accessRequest'
import { migrateOldSite } from './endpoints/seed/migrate-old-site'
import { telegramWebhookHandler } from './endpoints/telegramWebhook'

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
  // Sends through our own mail server. Without SMTP_HOST,
  // e.g. in local development, Payload only logs outgoing emails to the console.
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM_ADDRESS || 'noreply@otahoas.fi',
        defaultFromName: process.env.SMTP_FROM_NAME || 'OtaHoas',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          // 465 is implicit TLS; 587 starts plain and upgrades with STARTTLS
          secure: Number(process.env.SMTP_PORT) === 465,
          requireTLS: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        },
      })
    : undefined,
  globals: [Header, Footer, ReservationSettings, ReservationEmails],
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
      path: '/telegram/webhook',
      method: 'post',
      handler: telegramWebhookHandler,
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
