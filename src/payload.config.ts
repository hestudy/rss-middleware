// storage-adapter-import-placeholder
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import { Links } from './collections/Links'
import { Media } from './collections/Media'
import { Models } from './collections/Models'
import { Prompts } from './collections/Prompts'
import { RssItems } from './collections/RssItems'
import { Users } from './collections/Users'
import { fetchAndSaveRss } from './tasks/fetchAndSaveRss'
import { translateRss } from './tasks/translateRss'
import { rssWorkflow } from './workflows/rssWorkflow'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ['./components/beforeDashboard/Queue'],
      graphics: {
        Icon: './components/graphics/Icon',
        Logo: './components/graphics/Icon',
      },
    },
  },
  collections: [Users, Media, Models, Prompts, Links, RssItems],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
  jobs: {
    tasks: [fetchAndSaveRss, translateRss],
    workflows: [rssWorkflow],
    autoRun: [
      {
        cron: '0 * * * *',
      },
    ],
    shouldAutoRun: async (payload) => {
      const { totalDocs } = await payload.count({
        collection: 'payload-jobs',
        where: {
          workflowSlug: {
            equals: 'rss-workflow',
          },
          processing: {
            equals: true,
          },
        },
      })
      payload.logger.info('exisst rss jobs:' + totalDocs)
      if (totalDocs === 0) {
        const job = await payload.jobs.queue({
          workflow: 'rss-workflow',
          input: {},
        })
        payload.logger.info('queued rss job')
        payload.jobs.runByID({
          id: job.id,
        })
        payload.logger.info('run rss job')
      }
      return true
    },
  },
})
