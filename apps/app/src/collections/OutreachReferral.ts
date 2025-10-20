import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const OutreachReferral: CollectionConfig = {
  slug: 'outreach_referrals',
  labels: { singular: 'Outreach Referral', plural: 'Outreach Referrals' },
  admin: { useAsTitle: 'title'  ,
    hidden: true, },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'oaid', type: 'text', required: true },
    { name: 'title', type: 'json' },
    { name: 'depth', type: 'number', defaultValue: 0 },
    { name: 'order', type: 'number', defaultValue: 0 },
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
    { name: 'deleted_at', type: 'number', admin: { hidden: true } },
    { name: 'gin', type: 'json' },
    { name: 'fts', type: 'text' },
    { name: 'data_in', type: 'json' },
  ],
}

export default OutreachReferral

