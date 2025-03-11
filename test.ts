import { getPayloadSdk } from '@/common/getPayloadSdk'
import { exit } from 'process'

const test = async () => {
  const payload = await getPayloadSdk()
  const job = await payload.jobs.queue({
    workflow: 'rss-workflow',
    input: {},
  })
  await payload.jobs.runByID({
    id: job.id,
  })
}

test().then(() => {
  exit()
})
