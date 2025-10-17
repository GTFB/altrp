import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'
import { setCreatedAt, setUpdatedAt } from '../hooks/timestamps'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Media', plural: 'Media' },
  admin: { useAsTitle: 'file_name' },
  upload: true,
  fields: [
    { 
      name: 'uuid', 
      type: 'text', 
      required: true,
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'maid', type: 'text' },
    { name: 'title', type: 'json' },
    { name: 'alt_text', type: 'json' },
    { name: 'caption', type: 'json' },
    { name: 'file_name', type: 'text' },
    { name: 'file_path', type: 'text' },
    { name: 'mime_type', type: 'text' },
    { name: 'size_bytes', type: 'number' },
    { name: 'is_public', type: 'checkbox', defaultValue: true },
    { name: 'type', type: 'text' },
    { name: 'uploader_aid', type: 'text' },
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
    { name: 'data_in', type: 'json' },
  ],
}

export default Media


