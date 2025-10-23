import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Setting } from './collections/Setting'
import { Taxonomy } from './collections/Taxonomy'
import { User } from './collections/User'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Journal } from './collections/Journal'
import { Asset } from './collections/Asset'
import { AssetVariant } from './collections/AssetVariant'
import { Base } from './collections/Base'
import { BaseMove } from './collections/BaseMove'
import { BaseMoveRout } from './collections/BaseMoveRout'
import { Contractor } from './collections/Contractor'
import { Deal } from './collections/Deal'
import { DealProduct } from './collections/DealProduct'
import { Echelon } from './collections/Echelon'
import { EchelonEmployee } from './collections/EchelonEmployee'
import { EmployeeLeave } from './collections/EmployeeLeave'
import { EmployeeTimesheet } from './collections/EmployeeTimesheet'
import { Expanse } from './collections/Expanse'
import { Finance } from './collections/Finance'
import { Goal } from './collections/Goal'
import { Human } from './collections/Human'
import { Identity } from './collections/Identity'
import { JournalConnection } from './collections/JournalConnection'
import { JournalGeneration } from './collections/JournalGeneration'
import { JournalSystem } from './collections/JournalSystem'
import { Key } from './collections/Key'
import { Location } from './collections/Location'
import { Message } from './collections/Message'
import { MessageThread } from './collections/MessageThread'
import { Notice } from './collections/Notice'
import { Outreach } from './collections/Outreach'
import { OutreachReferral } from './collections/OutreachReferral'
import { Permission } from './collections/Permission'
import { Product } from './collections/Product'
import { ProductVariant } from './collections/ProductVariant'
import { Qualification } from './collections/Qualification'
import { Relation } from './collections/Relation'
import { Role } from './collections/Role'
import { RolePermission } from './collections/RolePermission'
import { UserRole } from './collections/UserRole'
import { Segment } from './collections/Segment'
import { Text } from './collections/Text'
import { TextVariant } from './collections/TextVariant'
import { University } from './collections/University'
import { UserBan } from './collections/UserBan'
import { UserSession } from './collections/UserSession'
import { UserVerification } from './collections/UserVerification'
import { Vote } from './collections/Vote'
import { Wallet } from './collections/Wallet'
import { WalletTransaction } from './collections/WalletTransaction'
import { Yield } from './collections/Yield'
import { Zoo } from './collections/Zoo'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

import { getCloudflareContext } from '@opennextjs/cloudflare';

const cloudflare = await getCloudflareContext({ async: true });

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
    user: User.slug,
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
  db:  sqliteD1Adapter({
    // @ts-ignore
    binding: cloudflare.env.D1,
  }),
  collections: [
    Setting,
    Taxonomy,
    Media,
    Pages,
    Posts,
    User,
    Journal,
    Asset,
    AssetVariant,
    Base,
    BaseMove,
    BaseMoveRout,
    Contractor,
    Deal,
    DealProduct,
    Echelon,
    EchelonEmployee,
    EmployeeLeave,
    EmployeeTimesheet,
    Expanse,
    Finance,
    Goal,
    Human,
    Identity,
    JournalConnection,
    JournalGeneration,
    JournalSystem,
    Key,
    Location,
    Message,
    MessageThread,
    Notice,
    Outreach,
    OutreachReferral,
    Permission,
    Product,
    ProductVariant,
    Qualification,
    Relation,
    Role,
    RolePermission,
    UserRole,
    Segment,
    Text,
    TextVariant,
    University,
    UserBan,
    UserSession,
    UserVerification,
    Vote,
    Wallet,
    WalletTransaction,
    Yield,
    Zoo,
  ],
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
