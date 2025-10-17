import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt } from '../hooks/timestamps'

export const JournalActivity: CollectionConfig = {
  slug: 'journals',
  labels: { singular: 'Journal', plural: 'Journals' },
  admin: { useAsTitle: 'action' },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'user_id', type: 'number' },
    { name: 'action', type: 'text' },
    { name: 'details', type: 'json' },
    { name: 'xaid', type: 'text' },
    { 
      name: 'created_at', 
      type: 'date',
      admin: { hidden: true },
      hooks: { beforeChange: [setCreatedAt] },
    },
  ],
}

export default JournalActivity


