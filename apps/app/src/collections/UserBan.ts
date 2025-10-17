import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt } from '../hooks/timestamps'

export const UserBan: CollectionConfig = {
  slug: 'user_bans',
  labels: { singular: 'User Ban', plural: 'User Bans' },
  admin: { useAsTitle: 'uuid' },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'user_uuid', type: 'text', required: true },
    { name: 'banned_by_aid', type: 'text' },
    { name: 'reason', type: 'json' },
    { name: 'type', type: 'text' },
    { name: 'expires_at', type: 'text' },
    { name: 'revoked_at', type: 'text' },
    { name: 'revoked_by_aid', type: 'text' },
    { 
      name: 'created_at', 
      type: 'date',
      admin: { hidden: true },
      hooks: { beforeChange: [setCreatedAt] },
    },
    { name: 'data_in', type: 'json' },
  ],
}

export default UserBan


