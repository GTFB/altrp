import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt } from '../hooks/timestamps'

export const UserRole: CollectionConfig = {
  slug: 'user_roles',
  labels: { singular: 'User Role', plural: 'User Roles' },
  admin: { hidden: true },
  fields: [
    { name: 'user_uuid', type: 'text', required: true },
    { name: 'role_uuid', type: 'text', required: true },
    
    { name: 'order', type: 'number', defaultValue: 0 },
    { 
      name: 'created_at', 
      type: 'date',
      admin: { hidden: true },
      hooks: { beforeChange: [setCreatedAt] },
    },
  ],
}

export default UserRole


