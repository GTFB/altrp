import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const Zoo: CollectionConfig = {
  slug: 'zoos',
  labels: { singular: 'Zoo', plural: 'Zoos' },
  admin: { useAsTitle: 'name'  ,
    hidden: true, },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'zaid', type: 'text' },
    { name: 'parent_zaid', type: 'text' },
    { name: 'name', type: 'json' },
    { name: 'birthday', type: 'text' },
    { name: 'sex', type: 'text' },
    { name: 'status_name', type: 'text' },
    { name: 'city_name', type: 'text' },
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
    { name: 'media_id', type: 'text' },
    { name: 'gin', type: 'json' },
    { name: 'fts', type: 'text' },
    { name: 'data_in', type: 'json' },
    { name: 'data_out', type: 'json' },
  ],
}

export default Zoo

