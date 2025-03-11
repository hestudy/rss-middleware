import { getPayloadSdk } from '@/common/getPayloadSdk'
import { exit } from 'process'

const test = async () => {
  const payload = await getPayloadSdk()
  const { docs, totalDocs } = await payload.find({
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
            equals: 'summary',
          },
        },
      ],
    },
  })
  console.log(totalDocs)
}

test().then(() => {
  exit()
})
