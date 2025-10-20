import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const Expanse: CollectionConfig = {
  slug: 'expanses',
  labels: { singular: 'Expanse', plural: 'Expanses' },
  admin: { useAsTitle: 'title'  ,
    hidden: true, },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'xaid', type: 'text' },
    { name: 'title', type: 'json' },
    { name: 'status_name', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0 },
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

export default Expanse

