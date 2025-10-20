import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const DealProduct: CollectionConfig = {
  slug: 'deal_products',
  labels: { singular: 'Deal Product', plural: 'Deal Products' },
  admin: { useAsTitle: 'uuid'  ,
    hidden: true, },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'full_daid', type: 'text', required: true },
    { name: 'full_paid', type: 'text', required: true },
    { name: 'quantity', type: 'number', required: true, defaultValue: 1 },
    { name: 'status_name', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0 },
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

export default DealProduct


