import type { CollectionConfig } from 'payload'

export const RssItems: CollectionConfig = {
  slug: 'rssItems',
  admin: {
    useAsTitle: 'link',
  },
  fields: [
    {
      name: 'link',
      type: 'text',
      required: true,
    },
    {
      name: 'origin',
      type: 'json',
      required: true,
    },
    {
      name: 'data',
      type: 'json',
    },
    {
      name: 'fullContent',
      type: 'code',
      maxLength: Number.MAX_SAFE_INTEGER,
    },
    {
      name: 'pubDate',
      type: 'date',
      index: true,
    },
    {
      name: 'rss',
      type: 'relationship',
      relationTo: 'links',
      required: true,
    },
  ],
}
