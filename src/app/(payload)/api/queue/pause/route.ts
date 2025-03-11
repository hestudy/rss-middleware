import { getPayloadSdk } from '@/common/getPayloadSdk'
import { NextRequest, NextResponse } from 'next/server'

export const GET = async (req: NextRequest) => {
  const payload = await getPayloadSdk()
  const { user } = await payload.auth({ headers: req.headers })

  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const list = await payload.find({
    collection: 'payload-jobs',
    where: {
      workflowSlug: {
        equals: 'rss-workflow',
      },
      processing: {
        equals: true,
      },
    },
    pagination: false,
  })

  for (const item of list.docs) {
    await payload.jobs.cancelByID({
      id: item.id,
    })
  }

  return new NextResponse('OK')
}
