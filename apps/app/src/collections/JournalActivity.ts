import type { CollectionConfig } from 'payload'
import { randomUUID } from 'node:crypto'

import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const JournalActivity: CollectionConfig = {
  slug: 'journal-activities',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'action',
    defaultColumns: ['action', 'user', 'created_at'],
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
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      index: true,
      required: true,
    },
    { name: 'action', type: 'text', required: true, index: true },
    { name: 'details', type: 'json' },
    { name: 'xaid', type: 'text', index: true },
    { name: 'created_at', type: 'text', index: true },
  ],
  hooks: {
    beforeValidate: [({ data, req }) => {
      if (data && (!data.uuid || data.uuid === '')) {
        data.uuid = randomUUID()
      }
      return data
    }],
  },
}


