import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const Employee: CollectionConfig = {
  slug: 'employees',
  labels: { singular: 'Employee', plural: 'Employees' },
  admin: { useAsTitle: 'email'  ,
    hidden: true, },
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
    { name: 'is_public', type: 'checkbox', defaultValue: false },
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
    { name: 'media_id', type: 'text' },
    { name: 'gin', type: 'json' },
    { name: 'fts', type: 'text' },
    { name: 'data_in', type: 'json' },
    { name: 'data_out', type: 'json' },
  ],
}

export default Employee


