// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Archieve } from './collections/Archieve'
import { ArchieveVariant } from './collections/ArchieveVariant'
import { Base } from './collections/Base'
import { BaseMove } from './collections/BaseMove'
import { BaseMoveRout } from './collections/BaseMoveRout'
import { Contractor } from './collections/Contractor'
import { Deal } from './collections/Deal'
import { DealProduct } from './collections/DealProduct'
import { Echelon } from './collections/Echelon'
import { EchelonEmployee } from './collections/EchelonEmployee'
import { Finance } from './collections/Finance'
import { Goal } from './collections/Goal'
import { Human } from './collections/Human'
import { Identity } from './collections/Identity'
import { JournalActivity } from './collections/JournalActivity'
import { JournalConnection } from './collections/JournalConnection'
import { JournalGeneration } from './collections/JournalGeneration'
import { JournalSystem } from './collections/JournalSystem'
import { Key } from './collections/Key'
import { Location } from './collections/Location'
import { Relation } from './collections/Relation'
import { Taxonomy } from './collections/Taxonomy'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      // The `BeforeLogin` component renders a message that you see while logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeLogin: ['@/components/BeforeLogin'],
      // The `BeforeDashboard` component renders the 'welcome' block that you see after logging into your admin panel.
      // Feel free to delete this at any time. Simply remove the line below.
      beforeDashboard: ['@/components/BeforeDashboard'],
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
  db: (process.env.DB_CLIENT || '').toLowerCase() === 'postgres'
    ? postgresAdapter({
        pool: {
          connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL || '',
        },
      })
    : sqliteAdapter({
        client: {
          url: process.env.DATABASE_URL || 'file:../../packages/db/app.database.sqlite',
        },
      }),
  collections: [Pages, Posts, Media, Categories, Archieve, ArchieveVariant, Base, BaseMove, BaseMoveRout, Contractor, Deal, DealProduct, Echelon, EchelonEmployee, Finance, Goal, Human, Identity, JournalActivity, JournalConnection, JournalGeneration, JournalSystem, Key, Location, Relation, Taxonomy, Users],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
