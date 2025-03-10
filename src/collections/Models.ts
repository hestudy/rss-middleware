import type { CollectionConfig } from 'payload'

export const Models: CollectionConfig = {
  slug: 'models',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'apiKey',
      type: 'text',
      required: true,
    },
    {
      name: 'baseUrl',
      type: 'text',
    },
  ],
}
