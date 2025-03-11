import { RssItem } from '@/payload-types'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import Rss from 'rss'
import Parser from 'rss-parser'
import dayjs from 'dayjs'

const payload = await getPayload({ config })

export const GET = async (
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string
    }>
  },
) => {
  const id = (await params).id

  const link = await payload.findByID({
    collection: 'links',
    id,
    joins: {
      rssItems: {
        where: {
          data: {
            exists: true,
          },
        },
        limit: 20,
        page: 1,
        sort: '-pubDate',
      },
    },
  })

  const data = link.data as
    | ({ [key: string]: any } & Parser.Output<{ [key: string]: any }>)
    | undefined

  if (data) {
    const feed = new Rss({
      feed_url: data.feedUrl!,
      site_url: data.link!,
      title: data.title!,
      description: data.description!,
      image_url: data.image?.url,
    })
    link.rssItems?.docs?.forEach((i) => {
      const item = i as RssItem
      const rssItem = item.data as Parser.Item
      feed.item({
        title: rssItem.title!,
        description: rssItem.content!,
        date: rssItem.pubDate!,
        url: rssItem.link!,
        categories: rssItem.categories,
        enclosure: rssItem.enclosure,
        guid: rssItem.guid,
      })
    })
    const headers = new Headers()
    headers.set('Content-Type', 'text/xml')
    return new NextResponse(feed.xml(), { status: 200, headers })
  }

  return new NextResponse('rss handing...', { status: 404 })
}
