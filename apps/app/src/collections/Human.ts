import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const Human: CollectionConfig = {
  slug: 'humans',
  labels: { singular: 'Human', plural: 'Humans' },
  admin: { useAsTitle: 'full_name' },
  fields: [
    { 
      name: 'uuid', 
      type: 'text', 
      required: true,
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'haid', type: 'text', required: true },
    { name: 'full_name', type: 'text', required: true },
    { name: 'birthday', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'sex', type: 'text' },
    { name: 'status_name', type: 'text' },
    { name: 'type', type: 'text' },
    { name: 'city_name', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'xaid', type: 'text' },
    { name: 'media_id', type: 'text' },
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

export default Human


