import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const Asset: CollectionConfig = {
  slug: 'assets',
  labels: { singular: 'Asset', plural: 'Assets' },
  admin: {
     useAsTitle: 'title',
     hidden: true,
  },
  fields: [
    { 
      name: 'uuid', 
      type: 'text', 
      required: true,
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'aaid', type: 'text', required: true },
    { name: 'owner_aid', type: 'text' },
    { name: 'number', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'url', type: 'text' },
    { name: 'type_name', type: 'text' },
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

export default Asset


