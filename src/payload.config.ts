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
    workflows: [
      {
        slug: 'rss-workflow',
        queue: 'rss',
        handler: async ({ req }) => {
          const links = await req.payload.find({
            collection: 'links',
            pagination: false,
          })
          console.log('link total:', links.totalDocs)
          for (const link of links.docs) {
            if (link.type === 'rss') {
              if (link.middleware === 'translate') {
                console.log('fetch rss:', link.url)
                const feed = await fetchRss(link.url)
                console.log('save rss:', link.url)
                await req.payload.update({
                  collection: 'links',
                  id: link.id,
                  data: {
                    data: feed,
                  },
                })

                console.log('save rss items total:', feed.items.length)
                for (const item of feed.items) {
                  console.log('save rss item:', item.link)
                  const { totalDocs } = await req.payload.count({
                    collection: 'rssItems',
                    where: {
                      and: [
                        {
                          rss: {
                            equals: link.id,
                          },
                          link: {
                            equals: item.link,
                          },
                        },
                      ],
                    },
                  })
                  if (totalDocs === 0) {
                    await req.payload.create({
                      collection: 'rssItems',
                      data: {
                        link: item.link!,
                        origin: item,
                        rss: link,
                      },
                    })
                    console.log('save rss item success:', item.link)
                  } else {
                    console.log('rss item is exist:', item.link)
                  }
                }

                const { docs, totalDocs } = await req.payload.find({
                  pagination: false,
                  collection: 'rssItems',
                  depth: 2,
                  where: {
                    and: [
                      {
                        data: {
                          exists: false,
                        },
                      },
                    ],
                  },
                })

                console.log('no translate rss item total:', totalDocs)
                for (let item of docs) {
                  const rss = item.rss as Link
                  const model = rss.model as Model
                  const prompt = rss.prompt as Prompt
                  const origin = item.origin as Parser.Item

                  console.log('translate rss item title:', origin.title)
                  const title = await textTranslate({
                    apiKey: model.apiKey,
                    baseUrl: model.baseUrl,
                    content: origin.title || '',
                    language: rss.language,
                    model: model.name,
                    prompt: prompt.prompt,
                  })
                  console.log('translate rss item title success:', origin.title, title)

                  let content = origin.content || ''
                  if (rss.scrapyFull) {
                    if (!item.fullContent) {
                      console.log('scrapy full rss item:', item.link)
                      const md = await linkToMd(item.link)
                      console.log('save full content:', item.link, md)
                      item = await req.payload.update({
                        collection: 'rssItems',
                        id: item.id,
                        data: {
                          fullContent: md,
                        },
                      })
                      console.log('save full content success', item.link)
                    }

                    content = item.fullContent || ''
                  }

                  console.log('translate rss item content:', content)
                  let translateContent = await textTranslate({
                    apiKey: model.apiKey,
                    baseUrl: model.baseUrl,
                    content,
                    language: rss.language,
                    model: model.name,
                    prompt: prompt.prompt,
                  })
                  console.log('translate rss item content success:', content, translateContent)

                  if (rss.scrapyFull) {
                    console.log('transfrom md to html:', translateContent)
                    translateContent = mdToHtml(translateContent)
                    console.log('transfrom md to html success:', translateContent)
                  }

                  console.log('save translate rss item:', item.link)
                  await req.payload.update({
                    collection: 'rssItems',
                    data: {
                      data: {
                        ...origin,
                        title,
                        content: translateContent,
                      },
                    },
                    id: item.id,
                  })
                  console.log('save translate rss item success:', item.link)
                }
              }
            }
          }
        },
      } as WorkflowConfig<'rss-workflow'>,
    ],
    autoRun: [
      {
        cron: '0 * * * *',
        limit: 1,
        queue: 'rss',
      },
    ],
    shouldAutoRun: async (payload) => {
      await payload.jobs.queue({
        workflow: 'rss-workflow',
        input: {},
      })
      return true
    },
  },
})
