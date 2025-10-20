import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const TextVariant: CollectionConfig = {
  slug: 'text_variants',
  labels: { singular: 'Text Variant', plural: 'Text Variants' },
  admin: { useAsTitle: 'title'  ,
    hidden: true, },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'taid', type: 'text' },
    { name: 'full_taid', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'type', type: 'text' },
    { name: 'status_name', type: 'text' },
    { name: 'version', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'xaid', type: 'text' },
    { 
      name: 'created_at', 
      type: 'date',
      admin: { hidden: true },
      hooks: { beforeChange: [setCreatedAt] },
    },
    { 
      name: 'updated_at', 
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

export default TextVariant


