import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const BaseMove: CollectionConfig = {
  slug: 'base_moves',
  labels: { singular: 'Base Move', plural: 'Base Moves' },
  admin: { useAsTitle: 'title' ,
    hidden: true, },
  fields: [
    { 
      name: 'uuid', 
      type: 'text', 
      required: true,
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'baid', type: 'text' },
    { name: 'full_baid', type: 'text' },
    { name: 'full_daid', type: 'text' },
    { name: 'number', type: 'text' },
    { name: 'title', type: 'text' },
    { name: 'laid_from', type: 'text' },
    { name: 'laid_to', type: 'text' },
    { name: 'cycle', type: 'json' },
    { name: 'status_name', type: 'text' },
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
    { name: 'data_out', type: 'json' },
  ],
}

export default BaseMove


