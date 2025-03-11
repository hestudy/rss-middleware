import { getPayloadSdk } from '@/common/getPayloadSdk'
import { exit } from 'process'
import Parser from 'rss-parser'

const seed = async () => {
  const payload = await getPayloadSdk()

  const { totalDocs } = await payload.count({
    collection: 'prompts',
  })
  if (totalDocs === 0) {
    await payload.create({
      collection: 'prompts',
      data: {
        name: 'translate prompt',
        prompt: `You are a professional translation engine, please translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it.
        
Translate into {language}:
"""
{content}
"""
        `,
        middleware: 'translate',
      },
    })
  }

  const noPubDateList = await payload.find({
    collection: 'rssItems',
    where: {
      and: [
        {
          data: {
            exists: true,
          },
          pubDate: {
            exists: false,
          },
        },
      ],
    },
    pagination: false,
  })

  for (const item of noPubDateList.docs) {
    await payload.update({
      collection: 'rssItems',
      id: item.id,
      data: {
        pubDate: (item.data as Parser.Item).pubDate,
      },
    })
  }

  const queueList = await payload.find({
    collection: 'payload-jobs',
    where: {
      and: [
        {
          workflowSlug: {
            equals: 'rss-workflow',
          },
          processing: {
            equals: true,
          },
        },
      ],
    },
    pagination: false,
  })

  for (const item of queueList.docs) {
    payload.jobs.runByID({
      id: item.id,
    })
  }
}

seed().then(() => {
  exit()
})
