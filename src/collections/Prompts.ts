import type { CollectionConfig } from 'payload'

export const Prompts: CollectionConfig = {
  slug: 'prompts',
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
      name: 'prompt',
      type: 'textarea',
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
      defaultValue: 'translate',
      required: true,
    },
  ],
}
