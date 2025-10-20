import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const Wallet: CollectionConfig = {
  slug: 'wallets',
  labels: { singular: 'Wallet', plural: 'Wallets' },
  admin: { useAsTitle: 'title'  ,
    hidden: true, },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'waid', type: 'text' },
    { name: 'full_waid', type: 'text' },
    { name: 'target_aid', type: 'text' },
    { name: 'title', type: 'json' },
    { name: 'status_name', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'xaid', type: 'text' },
    { 
      name: 'created_at', 
      type: 'date',
      admin: { hidden: true },
      hooks: { beforeChange: [setCreatedAt] },
    },
    { 
      name: 'updated_at', 
      type: 'date',
      admin: { hidden: true },
      hooks: { beforeChange: [setUpdatedAt] },
    },
    { name: 'deleted_at', type: 'number', admin: { hidden: true } },
    { name: 'gin', type: 'json' },
    { name: 'fts', type: 'text' },
    { name: 'data_in', type: 'json' },
    { name: 'data_out', type: 'json' },
  ],
}

export default Wallet


