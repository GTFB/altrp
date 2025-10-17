import { CollectionConfig } from 'payload'

export const Taxonomy: CollectionConfig = {
  slug: 'taxonomy',
  labels: { singular: 'Taxonomy', plural: 'Taxonomies' },
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'entity', type: 'text', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'title', type: 'text' },
    { name: 'sort_order', type: 'number', defaultValue: 0 },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
    { name: 'deleted_at', type: 'number' },
  ],
}

export default Taxonomy


