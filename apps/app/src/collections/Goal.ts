import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const Goal: CollectionConfig = {
  slug: 'goals',
  labels: { singular: 'Goal', plural: 'Goals' },
  admin: { useAsTitle: 'title' },
  fields: [
    { 
      name: 'uuid', 
      type: 'text', 
      required: true,
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'gaid', type: 'text', required: true },
    { name: 'full_gaid', type: 'text' },
    { name: 'parent_full_gaid', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'cycle', type: 'json' },
    { name: 'type', type: 'text' },
    { name: 'status_name', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'is_public', type: 'checkbox', defaultValue: true },
    { name: 'xaid', type: 'text' },
    { 
      name: 'updated_at', 
      type: 'date',
      admin: { hidden: true },
      hooks: { beforeChange: [setCreatedAt] },
    },
    { 
      name: 'created_at', 
      type: 'date',
      admin: { hidden: true },
      hooks: { beforeChange: [setUpdatedAt] },
    },
    { name: 'deleted_at', type: 'number', admin: { hidden: true } },
    { name: 'gin', type: 'json' },
    { name: 'fts', type: 'text' },
    { name: 'data_in', type: 'json' },
    { name: 'data_out', type: 'json' },
  ],
}

export default Goal


