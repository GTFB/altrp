import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const JournalConnection: CollectionConfig = {
  slug: 'journal_connections',
  labels: { singular: 'Journal Connection', plural: 'Journal Connections' },
  admin: { useAsTitle: 'relationship_name' },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'source_user_id', type: 'number' },
    { name: 'target_user_id', type: 'number' },
    { name: 'relationship_name', type: 'text' },
    { name: 'status', type: 'text' },
    { name: 'details', type: 'json' },
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
  ],
}

export default JournalConnection


