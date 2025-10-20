import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const Contractor: CollectionConfig = {
  slug: 'contractors',
  labels: { singular: 'Contractor', plural: 'Contractors' },
  admin: { useAsTitle: 'title' ,
    hidden: true, },
  fields: [
    { 
      name: 'uuid', 
      type: 'text', 
      required: true,
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'caid', type: 'text', required: true },
    { name: 'title', type: 'text', required: true },
    { name: 'reg', type: 'text' },
    { name: 'tin', type: 'text' },
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

export default Contractor


