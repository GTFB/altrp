import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const Identity: CollectionConfig = {
  slug: 'identities',
  labels: { singular: 'Identity', plural: 'Identities' },
  admin: { useAsTitle: 'uuid'  ,
    hidden: true, },
  fields: [
    { 
      name: 'uuid', 
      type: 'text', 
      required: true,
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'iaid', type: 'text', required: true },
    { name: 'entity_aid', type: 'text', required: true },
    { name: 'identity_aid', type: 'text', required: true },
    { name: 'permission', type: 'text' },
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

export default Identity


