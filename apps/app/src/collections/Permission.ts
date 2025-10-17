import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const Permission: CollectionConfig = {
  slug: 'permissions',
  labels: { singular: 'Permission', plural: 'Permissions' },
  admin: { useAsTitle: 'action_key'  ,
    hidden: true, },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'prm_aid', type: 'text' },
    { name: 'action_key', type: 'text', required: true },
    { name: 'title', type: 'json' },
    { name: 'group_name', type: 'text' },
    { name: 'description', type: 'text' },
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

export default Permission


