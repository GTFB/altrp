import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt } from '../hooks/timestamps'

export const JournalGeneration: CollectionConfig = {
  slug: 'journal_generations',
  labels: { singular: 'Journal Generation', plural: 'Journal Generations' },
  admin: { useAsTitle: 'model_name'  ,
    hidden: true, },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'full_maid', type: 'text' },
    { name: 'user_id', type: 'number' },
    { name: 'model_name', type: 'text' },
    { name: 'status', type: 'text' },
    { name: 'token_in', type: 'number' },
    { name: 'token_out', type: 'number' },
    { name: 'total_token', type: 'number' },
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

export default JournalGeneration


