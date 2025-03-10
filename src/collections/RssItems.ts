import type { CollectionConfig } from 'payload'

export const RssItems: CollectionConfig = {
  slug: 'rssItems',
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
      type: 'textarea',
    },
    {
      name: 'rss',
      type: 'relationship',
      relationTo: 'links',
      required: true,
    },
  ],
}
