// storage-adapter-import-placeholder
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, WorkflowConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { postgresAdapter } from '@payloadcms/db-postgres'
import Parser from 'rss-parser'
import { Links } from './collections/Links'
import { Media } from './collections/Media'
import { Models } from './collections/Models'
import { Prompts } from './collections/Prompts'
import { RssItems } from './collections/RssItems'
import { Users } from './collections/Users'
import { Link, Model, Prompt } from './payload-types'
import { fetchRss } from './utils/fetchRss'
import { linkToMd } from './utils/linkToMd'
import { mdToHtml } from './utils/mdToHtml'
import { textTranslate } from './utils/textTranslate'
import { rssWorkflow } from './workflow/rssWorkflow'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
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
    tasks: [],
    workflows: [rssWorkflow],
    autoRun: [
      {
        cron: '0 * * * *',
        queue: 'rss',
      },
    ],
    shouldAutoRun: async (payload) => {
      const { totalDocs } = await payload.count({
        collection: 'payload-jobs',
        where: {
          processing: {
            equals: true,
          },
        },
      })
      if (totalDocs === 0) {
        await payload.jobs.queue({
          workflow: 'rss-workflow',
          input: {},
        })
      }
      return totalDocs === 0
    },
  },
})
