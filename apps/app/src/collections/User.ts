import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const User: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'User', plural: 'Users' },
  auth: true,
  admin: { useAsTitle: 'email', group: 'System' },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { hidden: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'human_aid', type: 'text', admin: { hidden: true } },
    { name: 'email', type: 'email', required: true },
    { name: 'password_hash', type: 'text', admin: { hidden: true } },
    { name: 'is_active', type: 'checkbox', defaultValue: true, admin: { hidden: true } },
    { name: 'last_login_at', type: 'text', admin: { hidden: true } },
    { name: 'email_verified_at', type: 'text', admin: { hidden: true } },
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
    { name: 'deleted_at', type: 'date', admin: { hidden: true } },
    { name: 'data_in', type: 'json', admin: { hidden: true } },
  ],
}

export default User


