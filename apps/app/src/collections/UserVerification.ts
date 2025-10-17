import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt } from '../hooks/timestamps'

export const UserVerification: CollectionConfig = {
  slug: 'user_verifications',
  labels: { singular: 'User Verification', plural: 'User Verifications' },
  admin: { useAsTitle: 'uuid'  ,
    hidden: true, },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'user_uuid', type: 'text', required: true },
    { name: 'type', type: 'text' },
    { name: 'token_hash', type: 'text', required: true },
    { name: 'expires_at', type: 'text' },
    { name: 'verified_at', type: 'text' },
    { 
      name: 'created_at', 
      type: 'date',
      admin: { hidden: true },
      hooks: { beforeChange: [setCreatedAt] },
    },
    { name: 'data_in', type: 'json' },
  ],
}

export default UserVerification


