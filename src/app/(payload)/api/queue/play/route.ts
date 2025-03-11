import { getPayloadSdk } from '@/common/getPayloadSdk'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest) => {
  const payload = await getPayloadSdk()
  const { user } = await payload.auth({ headers: req.headers })

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

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

  if (totalDocs === 0) {
    const job = await payload.jobs.queue({
      workflow: 'rss-workflow',
      input: {},
    })
    payload.jobs.runByID({
      id: job.id,
    })
  }

  return new NextResponse('OK')
}
