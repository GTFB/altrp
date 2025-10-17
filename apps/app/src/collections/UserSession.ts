import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt } from '../hooks/timestamps'

export const UserSession: CollectionConfig = {
  slug: 'user_sessions',
  labels: { singular: 'User Session', plural: 'User Sessions' },
  admin: { useAsTitle: 'uuid' },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'user_uuid', type: 'text', required: true },
    { name: 'token_hash', type: 'text', required: true },
    { name: 'ip_address', type: 'text' },
    { name: 'user_agent', type: 'text' },
    { name: 'last_active_at', type: 'text' },
    { name: 'expires_at', type: 'text' },
    { name: 'xaid', type: 'text' },
    { 
      name: 'created_at', 
      type: 'date',
      admin: { hidden: true },
      hooks: { beforeChange: [setCreatedAt] },
    },
    { name: 'data_in', type: 'json' },
  ],
}

export default UserSession


