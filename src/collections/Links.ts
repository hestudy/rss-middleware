import type { CollectionConfig } from 'payload'

export const Links: CollectionConfig = {
  slug: 'links',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
    {
      name: 'data',
      type: 'json',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'language',
      type: 'text',
      required: true,
    },
    {
      name: 'scrapyFull',
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: [
        {
          label: 'rss',
          value: 'rss',
        },
        {
          label: 'url',
          value: 'url',
        },
      ],
      required: true,
    },
    {
      name: 'middleware',
      type: 'select',
      options: [
        {
          label: 'translate',
          value: 'translate',
        },
        {
          label: 'summary',
          value: 'summary',
        },
      ],
      required: true,
    },
    {
      name: 'model',
      type: 'relationship',
      relationTo: 'models',
      required: true,
    },
    {
      name: 'prompt',
      type: 'relationship',
      relationTo: 'prompts',
      required: true,
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'rssItems',
      type: 'join',
      collection: 'rssItems',
      on: 'rss',
    },
    {
      name: 'rss',
      type: 'ui',
      admin: {
        components: {
          Cell: './components/Links/Cell',
        },
      },
    },
  ],
}
