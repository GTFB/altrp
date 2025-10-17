import { CollectionConfig } from 'payload'
import { generateUUID } from '../hooks/generateUUID'

export const EmployeeLeave: CollectionConfig = {
  slug: 'employee_leaves',
  labels: { singular: 'Employee Leave', plural: 'Employee Leaves' },
  admin: { useAsTitle: 'uuid' },
  fields: [
    { 
      name: 'uuid', 
      type: 'text',
      admin: { readOnly: true },
      hooks: { beforeChange: [generateUUID] },
    },
    { name: 'elaid', type: 'text' },
    { name: 'full_eaid', type: 'text' },
    { name: 'type', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0 },
    { name: 'xaid', type: 'text' },
    { name: 'started_at', type: 'text' },
    { name: 'ended_at', type: 'text' },
    { name: 'duration', type: 'number' },
    { name: 'data_in', type: 'json' },
  ],
}

export default EmployeeLeave


