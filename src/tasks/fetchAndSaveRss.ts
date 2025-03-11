import { fetchRss } from '@/utils/fetchRss'
import { TaskConfig } from 'payload'

export const fetchAndSaveRss = {
  slug: 'fetchAndSaveRss',
  retries: 3,
  handler: async ({ req, inlineTask }) => {
    const logger = req.payload.logger

    const links = await req.payload.find({
      collection: 'links',
      pagination: false,
    })
    logger.info('link total:' + links.totalDocs)

    for (const link of links.docs) {
      if (link.type === 'rss') {
        if (link.middleware === 'translate') {
          await inlineTask(`fetchAndSaveRss:${link.url}`, {
            task: async ({ req, inlineTask }) => {
              const logger = req.payload.logger
              logger.info('fetch rss:' + link.url)
              const feed = await fetchRss(link.url)
              logger.info('save rss:' + link.url)
              await req.payload.update({
                collection: 'links',
                id: link.id,
                data: {
                  data: feed,
                },
              })
              logger.info('save rss success:' + link.url)

              for (const item of feed.items) {
                await inlineTask(`save rss item:${item.link}`, {
                  task: async ({ req }) => {
                    const logger = req.payload.logger
                    logger.info('save rss item:' + item.link)
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
                      logger.info('save rss item success:' + item.link)
                    } else {
                      logger.info('rss item is exist:' + item.link)
                    }
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
            retries: 3,
            input: {},
          })
        }
      }
    }

    return {
      output: {},
    }
  },
} as TaskConfig<'fetchAndSaveRss'>
