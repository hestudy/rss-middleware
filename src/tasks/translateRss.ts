import { Link, Model, Prompt } from '@/payload-types'
import { linkToMd } from '@/utils/linkToMd'
import { mdToHtml } from '@/utils/mdToHtml'
import { textTranslate } from '@/utils/textTranslate'
import { TaskConfig } from 'payload'
import Parser from 'rss-parser'

export const translateRss = {
  slug: 'translateRss',
  retries: 3,
  handler: async ({ req, inlineTask }) => {
    const logger = req.payload.logger

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
            'rss.middleware': {
              equals: 'translate',
            },
            'rss.enabled': {
              equals: true,
            },
          },
        ],
      },
    })

    logger.info('no translate rss item total:' + totalDocs)
    for (let item of docs) {
      await inlineTask(`translate rss item:${item.link}`, {
        task: async ({ req, inlineTask }) => {
          const logger = req.payload.logger
          const rss = item.rss as Link
          const model = rss.model as Model
          const prompt = rss.prompt as Prompt
          const origin = item.origin as Parser.Item

          logger.info('translate rss item title:' + origin.title)
          const title = await textTranslate({
            apiKey: model.apiKey,
            baseUrl: model.baseUrl,
            content: origin.title || '',
            language: rss.language,
            model: model.name,
            prompt: prompt.prompt,
          })
          logger.info('translate rss item title success:' + origin.title, title)

          let content = origin.content || ''
          if (rss.scrapyFull) {
            if (!item.fullContent) {
              await inlineTask(`scrapy full rss item:${item.link}`, {
                retries: 3,
                task: async ({ req }) => {
                  const logger = req.payload.logger
                  logger.info('scrapy full rss item:' + item.link)
                  const md = await linkToMd(item.link)
                  logger.info('save full content:' + item.link, md)
                  item = await req.payload.update({
                    collection: 'rssItems',
                    id: item.id,
                    data: {
                      fullContent: md,
                    },
                  })
                  logger.info('save full content success' + item.link)
                  return {
                    output: {},
                  }
                },
                input: {},
              })
            }

            content = item.fullContent || ''
          }

          let translateContent = ''

          await inlineTask(`translate rss item content:${item.link}`, {
            retries: 3,
            task: async ({ req }) => {
              const logger = req.payload.logger
              logger.info('translate rss item content:' + content)
              translateContent = await textTranslate({
                apiKey: model.apiKey,
                baseUrl: model.baseUrl,
                content,
                language: rss.language,
                model: model.name,
                prompt: prompt.prompt,
              })
              logger.info('translate rss item content success:' + content, translateContent)
              return {
                output: {},
              }
            },
            input: {},
          })

          if (rss.scrapyFull) {
            logger.info('transfrom md to html:' + translateContent)
            translateContent = mdToHtml(translateContent)
            logger.info('transfrom md to html success:' + translateContent)
          }

          logger.info('save translate rss item:' + item.link)
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
          logger.info('save translate rss item success:' + item.link)
          return {
            output: {},
          }
        },
        retries: 3,
        input: {},
      })
    }

    return {
      output: {},
    }
  },
} as TaskConfig<'translateRss'>
