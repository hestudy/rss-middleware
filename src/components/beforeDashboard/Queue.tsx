import { getPayloadSdk } from '@/common/getPayloadSdk'
import { Pause, Play } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import QueueButton from '../QueueButton'
import { cn } from '@/common/cn'

export default async function Queue() {
  const payload = await getPayloadSdk()
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

  const processing = totalDocs !== 0

  return (
    <div className="dashboard__group">
      <h2 className="dashboard__label">Queue</h2>
      <ul className="dashboard__card-list">
        <li>
          <div className="card">
            <h3 className="card__title">Rss Workflow</h3>
            <div className="card__actions">
              <QueueButton
                processing={processing}
                onOk={async () => {
                  'use server'
                  revalidatePath('/admin')
                }}
              >
                <span className="btn__content">
                  <span
                    className={cn('btn__icon', processing ? 'border-red-500' : 'border-green-500')}
                  >
                    {!processing && <Play className="icon size-4 text-green-500" />}
                    {processing && <Pause className="icon size-4 text-red-500" />}
                  </span>
                </span>
              </QueueButton>
            </div>
          </div>
        </li>
      </ul>
    </div>
  )
}
