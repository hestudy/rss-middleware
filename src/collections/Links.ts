import type { CollectionConfig } from 'payload'

export const Links: CollectionConfig = {
  slug: 'prompts',
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
      name: 'language',
      type: 'text',
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
    },
    {
      name: 'prompt',
      type: 'relationship',
      relationTo: 'prompts',
    },
  ],
}
