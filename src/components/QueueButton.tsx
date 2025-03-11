'use client'

import { useAuth } from '@payloadcms/ui'
import { useRequest } from 'ahooks'
import { PropsWithChildren } from 'react'

export default function QueueButton(
  props: PropsWithChildren<{
    processing: boolean
    onOk?: () => void
  }>,
) {
  const { token } = useAuth()

  const playReq = useRequest(
    async () => {
      await fetch('/api/queue/play', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      props.onOk?.()
    },
    {
      manual: true,
    },
  )
  const pauseReq = useRequest(
    async () => {
      await fetch('/api/queue/pause', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      props.onOk?.()
    },
    {
      manual: true,
    },
  )

  return (
    <button
      disabled={playReq.loading || pauseReq.loading}
      className="btn btn--icon btn--icon-style-with-border btn--icon-only btn--size-medium btn--icon-position-right btn--withoutPopup btn--style-icon-label btn--round btn--withoutPopup"
      onClick={() => {
        if (!props.processing) {
          playReq.run()
        } else {
          pauseReq.run()
        }
      }}
    >
      {props.children}
    </button>
  )
}
