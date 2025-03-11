import { Link as LinkType } from '@/payload-types'
import { Rss } from 'lucide-react'
import Link from 'next/link'
import { DefaultServerCellComponentProps } from 'payload'

export default async function Cell(props: DefaultServerCellComponentProps<any, LinkType>) {
  return (
    <div>
      <Link href={`/api/rss/${props.rowData.id}`} target="_blank">
        <Rss />
      </Link>
    </div>
  )
}
