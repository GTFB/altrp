import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const Key: CollectionConfig = {
  slug: 'keys',
  labels: { singular: 'Key', plural: 'Keys' },
  admin: { useAsTitle: 'kaid'  ,
    hidden: true, },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'kaid', type: 'text', required: true },
    { name: 'key_prefix', type: 'text' },
    { name: 'key_hash', type: 'text', required: true },
    { name: 'title', type: 'text' },
    { name: 'is_active', type: 'checkbox', defaultValue: true },
    { name: 'is_valid', type: 'checkbox', defaultValue: true },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'xaid', type: 'text' },
    { name: 'permission_id', type: 'number' },
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
    { name: 'data_in', type: 'json' },
  ],
}

export default Key


