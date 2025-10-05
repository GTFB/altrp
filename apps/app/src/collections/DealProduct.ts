import type { CollectionConfig } from 'payload'
import { randomUUID } from 'node:crypto'

import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const DealProduct: CollectionConfig = {
  slug: 'deal-products',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'full_paid',
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
    { name: 'full_daid', type: 'text', index: true },
    { name: 'full_paid', type: 'text', index: true },
    { name: 'quantity', type: 'number' },
    { name: 'status_name', type: 'text', index: true },
    { name: 'order', type: 'number' },
    { name: 'created_at', type: 'text' },
    { name: 'updated_at', type: 'text' },
    {
      type: 'group',
      name: 'system',
      admin: { label: 'System', description: 'Technical fields', condition: () => false },
      fields: [
        { name: 'data_in', type: 'json' },
      ],
    },
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


