import type { CollectionConfig } from 'payload'
import { randomUUID } from 'node:crypto'

import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const Taxonomy: CollectionConfig = {
  slug: 'taxonomies',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'uuid',
      type: 'text',
      required: true,
      index: true,
      unique: true,
      validate: (val) => {
        if (typeof val !== 'string') return 'uuid must be a string'
        const re = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return re.test(val) || 'Invalid UUID v4 format'
      },
    },
    { name: 'entity', type: 'text', index: true },
    { name: 'name', type: 'text', required: true, index: true },
    { name: 'title', type: 'text', index: true },
    { name: 'order', type: 'number' },
  ],
  hooks: {
    beforeValidate: [({ data }) => {
      if (data && (!data.uuid || data.uuid === '')) {
        data.uuid = randomUUID()
      }
      return data
    }],
  },
}


