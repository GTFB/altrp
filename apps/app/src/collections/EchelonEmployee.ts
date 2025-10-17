import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const EchelonEmployee: CollectionConfig = {
  slug: 'echelon_employees',
  labels: { singular: 'Echelon Employee', plural: 'Echelon Employees' },
  admin: { useAsTitle: 'email' },
  fields: [
    { 
      name: 'uuid', 
      type: 'text', 
      required: true,
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'eaid', type: 'text', required: true },
    { name: 'full_eaid', type: 'text' },
    { name: 'haid', type: 'text', required: true },
    { name: 'email', type: 'email' },
    { name: 'status_name', type: 'text' },
    { name: 'is_public', type: 'checkbox', defaultValue: true },
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

export default EchelonEmployee


