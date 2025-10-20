import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt } from '../hooks/timestamps'

export const JournalSystem: CollectionConfig = {
  slug: 'journal_system',
  labels: { singular: 'Journal System', plural: 'Journal System' },
  admin: { useAsTitle: 'entity_aid'  ,
    hidden: true, },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'entity_aid', type: 'text' },
    { name: 'user_id', type: 'number' },
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

export default JournalSystem


