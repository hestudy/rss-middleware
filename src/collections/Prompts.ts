import type { CollectionConfig } from 'payload'

export const Prompts: CollectionConfig = {
  slug: 'prompts',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'prompt',
      type: 'text',
      required: true,
    },
  ],
}
