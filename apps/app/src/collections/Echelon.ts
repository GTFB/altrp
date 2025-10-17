import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const Echelon: CollectionConfig = {
  slug: 'echelons',
  labels: { singular: 'Echelon', plural: 'Echelons' },
  admin: { useAsTitle: 'position' },
  fields: [
    { 
      name: 'uuid', 
      type: 'text', 
      required: true,
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'eaid', type: 'text', required: true },
    { name: 'parent_eaid', type: 'text' },
    { name: 'department_id', type: 'text' },
    { name: 'position', type: 'text' },
    { name: 'city_name', type: 'text' },
    { name: 'status_name', type: 'text' },
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
    { name: 'data_in', type: 'json' },
  ],
}

export default Echelon


