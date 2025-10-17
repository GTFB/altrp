import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt } from '../hooks/timestamps'

export const Journal: CollectionConfig = {
  slug: 'journals',
  labels: { singular: 'Journal', plural: 'Journals' },
  admin: { 
    useAsTitle: 'action',
    group: 'System',
    description: 'System activity log. Records are created automatically.',
  },
  access: {
    create: () => false,
  },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { 
      name: 'user_id', 
      type: 'number',     
      admin: { readOnly: true },
  },
    { 
      name: 'action', 
      type: 'text',
      admin: { readOnly: true },
    },
    { 
      name: 'details', 
      type: 'json',
      admin: { readOnly: true },
    },
    { 
      name: 'xaid', 
      type: 'text',
      admin: { readOnly: true },
    },
    { 
      name: 'created_at', 
      type: 'date',
      admin: { hidden: true },
      hooks: { beforeChange: [setCreatedAt] },
    },
  ],
}

export default Journal


