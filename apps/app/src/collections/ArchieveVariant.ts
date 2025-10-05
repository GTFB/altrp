import type { CollectionConfig } from 'payload'
import { randomUUID } from 'node:crypto'

import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const ArchieveVariant: CollectionConfig = {
  slug: 'archieve-variant',
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
    { name: 'aaid', type: 'text', index: true },
    { name: 'full_aaid', type: 'text', index: true },
    {
      name: 'number',
      type: 'text',
      index: true,
      validate: (val) => {
        if (val == null || val === '') return true
        if (typeof val !== 'string') return 'number must be a string'
        return /^\d+$/.test(val) || 'Digits only'
      },
    },
    { name: 'title', type: 'text', required: true, index: true },
    {
      name: 'media',
      type: 'relationship',
      relationTo: 'media',
    },
    { name: 'version', type: 'text' },
    { name: 'order', type: 'number' },
    { name: 'xaid', type: 'text', index: true },
    { name: 'created_at', type: 'text' },
    { name: 'updated_at', type: 'text' },
    {
      type: 'group',
      name: 'system',
      admin: { label: 'System', description: 'Technical fields', condition: () => false },
      fields: [
        { name: 'gin', type: 'json' },
        { name: 'fts', type: 'text' },
        { name: 'data_in', type: 'json' },
        { name: 'data_out', type: 'json' },
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


