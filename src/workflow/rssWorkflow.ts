import { Link, Model, Prompt } from '@/payload-types'
import { fetchRss } from '@/utils/fetchRss'
import { linkToMd } from '@/utils/linkToMd'
import { mdToHtml } from '@/utils/mdToHtml'
import { textTranslate } from '@/utils/textTranslate'
import { WorkflowConfig } from 'payload'
import Parser from 'rss-parser'

export const rssWorkflow = {
  slug: 'rss-workflow',
  queue: 'rss',
  handler: async ({ req }) => {
    const logger = req.payload.logger
    const links = await req.payload.find({
      collection: 'links',
      pagination: false,
    })
    logger.info('link total:', links.totalDocs)
    for (const link of links.docs) {
      if (link.type === 'rss') {
        if (link.middleware === 'translate') {
          logger.info('fetch rss:', link.url)
          const feed = await fetchRss(link.url)
          logger.info('save rss:', link.url)
          await req.payload.update({
            collection: 'links',
            id: link.id,
            data: {
              data: feed,
            },
          })

          logger.info('save rss items total:', feed.items.length)
          for (const item of feed.items) {
            logger.info('save rss item:', item.link)
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
              logger.info('save rss item success:', item.link)
            } else {
              logger.info('rss item is exist:', item.link)
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

          logger.info('no translate rss item total:', totalDocs)
          for (let item of docs) {
            const rss = item.rss as Link
            const model = rss.model as Model
            const prompt = rss.prompt as Prompt
            const origin = item.origin as Parser.Item

            logger.info('translate rss item title:', origin.title)
            const title = await textTranslate({
              apiKey: model.apiKey,
              baseUrl: model.baseUrl,
              content: origin.title || '',
              language: rss.language,
              model: model.name,
              prompt: prompt.prompt,
            })
            logger.info('translate rss item title success:', origin.title, title)

            let content = origin.content || ''
            if (rss.scrapyFull) {
              if (!item.fullContent) {
                logger.info('scrapy full rss item:', item.link)
                const md = await linkToMd(item.link)
                logger.info('save full content:', item.link, md)
                item = await req.payload.update({
                  collection: 'rssItems',
                  id: item.id,
                  data: {
                    fullContent: md,
                  },
                })
                logger.info('save full content success', item.link)
              }

              content = item.fullContent || ''
            }

            logger.info('translate rss item content:', content)
            let translateContent = await textTranslate({
              apiKey: model.apiKey,
              baseUrl: model.baseUrl,
              content,
              language: rss.language,
              model: model.name,
              prompt: prompt.prompt,
            })
            logger.info('translate rss item content success:', content, translateContent)

            if (rss.scrapyFull) {
              logger.info('transfrom md to html:', translateContent)
              translateContent = mdToHtml(translateContent)
              logger.info('transfrom md to html success:', translateContent)
            }

            logger.info('save translate rss item:', item.link)
            await req.payload.update({
              collection: 'rssItems',
              data: {
                data: {
                  ...origin,
                  title,
                  content: translateContent,
                },
                pubDate: item.pubDate,
              },
              id: item.id,
            })
            logger.info('save translate rss item success:', item.link)
          }
        }
      }
    }
  },
} as WorkflowConfig<'rss-workflow'>
