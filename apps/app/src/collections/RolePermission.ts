import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt } from '../hooks/timestamps'

export const RolePermission: CollectionConfig = {
  slug: 'role_permissions',
  labels: { singular: 'Role Permission', plural: 'Role Permissions' },
  admin: { useAsTitle: 'uuid' },
  fields: [
    { name: 'role_uuid', type: 'text', required: true },
    { name: 'permission_uuid', type: 'text', required: true },
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'xaid', type: 'text' },
    { 
      name: 'created_at', 
      type: 'date',
      admin: { hidden: true },
      hooks: { beforeChange: [setCreatedAt] },
    },
  ],
}

export default RolePermission


