import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const Notice: CollectionConfig = {
  slug: 'notices',
  labels: { singular: 'Notice', plural: 'Notices' },
  admin: { useAsTitle: 'title' },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'naid', type: 'text' },
    { name: 'target_aid', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'is_read', type: 'checkbox', defaultValue: false },
    { name: 'type_name', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0 },
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
    { name: 'data_in', type: 'json' },
  ],
}

export default Notice


