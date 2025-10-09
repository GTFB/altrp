import type { CollectionConfig } from 'payload'
import { randomUUID } from 'node:crypto'

import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'

export const EchelonEmployee: CollectionConfig = {
  slug: 'echelon-employees',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'email',
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
    { name: 'eaid', type: 'text', index: true },
    { name: 'full_eaid', type: 'text', index: true },
    { name: 'haid', type: 'text', index: true },
    { name: 'email', type: 'text', index: true, validate: (val) => {
      if (val == null || val === '') return true
      if (typeof val !== 'string') return 'email must be a string'
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(val) || 'Invalid email format'
    } },
    { name: 'status_name', type: 'text', index: true },
    { name: 'order', type: 'number' },
    { name: 'xaid', type: 'text', index: true },
    { name: 'created_at', type: 'text' },
    { name: 'updated_at', type: 'text' },
    { name: 'deleted_at', type: 'text' },
    {
      name: 'media',
      type: 'relationship',
      relationTo: 'media',
    },
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


