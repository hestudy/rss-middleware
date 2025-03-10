import config from '@payload-config'
import { getPayload } from 'payload'
import { exit } from 'process'

const test = async () => {
  const payload = await getPayload({ config })
  await payload.jobs.queue({
    workflow: 'rss-workflow',
    input: {},
  })
  await payload.jobs.run({
    queue: 'rss',
  })
}

test().then(() => {
  exit()
})
